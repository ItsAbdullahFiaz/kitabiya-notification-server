const Product = require('../models/product.model');
const User = require('../models/user.model');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class ProductService {
    static async createProduct(userId, productData, images) {
        try {
            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Upload images to Cloudinary
            const uploadPromises = images.map(image =>
                cloudinary.uploader.upload(image.path, {
                    folder: 'products'
                })
            );

            const uploadedImages = await Promise.all(uploadPromises);
            const imageUrls = uploadedImages.map(result => result.secure_url);

            // Create product with flat structure
            const product = await Product.create({
                userId,
                title: productData.title,
                price: productData.price,
                categoryId: productData.categoryId,
                categorySubId: productData.categorySubId,
                condition: productData.condition,
                type: productData.type,
                language: productData.language,
                description: productData.description,
                locationLatitude: productData.locationLatitude,
                locationLongitude: productData.locationLongitude,
                locationAddress: productData.locationAddress,
                images: imageUrls
            });

            return {
                ...product.toObject(),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            };
        } catch (error) {
            logger.error('Error in ProductService.createProduct:', error);
            throw error;
        }
    }

    static async getAllProducts({ page = 1, limit = 10, sort = '-createdAt' }) {
        try {
            const skip = (page - 1) * limit;

            // Get products
            const products = await Product.find()
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            // Get total count
            const total = await Product.countDocuments();

            // Get valid user IDs (ensure they are valid ObjectIds)
            const userIds = products
                .map(p => p.userId)
                .filter(id => mongoose.Types.ObjectId.isValid(id));

            // Fetch users only if we have valid IDs
            let userMap = {};
            if (userIds.length > 0) {
                const users = await User.find({
                    _id: { $in: userIds }
                }).lean();

                userMap = users.reduce((acc, user) => {
                    acc[user._id.toString()] = {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    };
                    return acc;
                }, {});
            }

            // Format products
            const formattedProducts = products.map(product => {
                const userId = product.userId ? product.userId.toString() : null;
                return {
                    ...product,
                    user: userId && userMap[userId] ? userMap[userId] : null,
                    userId: undefined
                };
            });

            return {
                products: formattedProducts,
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            logger.error('Error in ProductService.getAllProducts:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    static async getUserProducts(userId) {
        return await Product.find({ userId })
            .sort({ createdAt: -1 })
            .lean();
    }

    static async getProductById(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid product ID');
            }

            const product = await Product.findById(id).lean();
            if (!product) {
                return null;
            }

            let user = null;
            if (product.userId && mongoose.Types.ObjectId.isValid(product.userId)) {
                user = await User.findById(product.userId).lean();
            }

            return {
                ...product,
                user: user ? {
                    id: user._id,
                    name: user.name,
                    email: user.email
                } : null,
                userId: undefined
            };
        } catch (error) {
            logger.error('Error in ProductService.getProductById:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    static async deleteProduct(productId, userId) {
        return await Product.findOneAndDelete({
            _id: productId,
            userId
        });
    }

    static async getProductsByUser({ userId, page = 1, limit = 10, sort = '-createdAt' }) {
        try {
            const skip = (page - 1) * limit;

            const [products, total] = await Promise.all([
                Product.find({ userId })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Product.countDocuments({ userId })
            ]);

            const user = await User.findById(userId).lean();
            const userData = user ? {
                id: user._id,
                name: user.name,
                email: user.email
            } : null;

            const formattedProducts = products.map(product => ({
                ...product,
                user: userData,
                userId: undefined
            }));

            return {
                products: formattedProducts,
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            logger.error('Error in getProductsByUser:', error);
            throw error;
        }
    }

    static async updateProduct(id, updateData, newImages = []) {
        try {
            const product = await Product.findById(id);
            if (!product) return null;

            // Upload new images if provided
            let imageUrls = [...product.images];
            if (newImages.length > 0) {
                const uploadPromises = newImages.map(image =>
                    cloudinary.uploader.upload(image.path, {
                        folder: 'products'
                    })
                );
                const uploadedImages = await Promise.all(uploadPromises);
                const newImageUrls = uploadedImages.map(result => result.secure_url);
                imageUrls = [...imageUrls, ...newImageUrls];
            }

            // Update product
            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                {
                    ...updateData,
                    images: imageUrls
                },
                { new: true }
            ).lean();

            // Get user data
            const user = await User.findById(updatedProduct.userId).lean();

            return {
                ...updatedProduct,
                user: user ? {
                    id: user._id,
                    name: user.name,
                    email: user.email
                } : null,
                userId: undefined
            };
        } catch (error) {
            logger.error('Error in updateProduct:', error);
            throw error;
        }
    }

    static async deleteProduct(id) {
        try {
            const product = await Product.findByIdAndDelete(id);
            if (!product) return null;

            // Delete images from Cloudinary
            const deletePromises = product.images.map(imageUrl => {
                const publicId = imageUrl.split('/').pop().split('.')[0];
                return cloudinary.uploader.destroy(`products/${publicId}`);
            });

            await Promise.all(deletePromises);

            return true;
        } catch (error) {
            logger.error('Error in deleteProduct:', error);
            throw error;
        }
    }

    static async searchProducts(criteria) {
        try {
            const { query, filters, sort, pagination } = criteria;

            // Build search query
            const searchQuery = {};

            // Text search
            if (query && query.trim() !== '') {
                searchQuery.$or = [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ];
            }

            // Apply filters
            if (filters.type) {
                searchQuery.type = filters.type;
            }
            if (filters.condition) {
                searchQuery.condition = filters.condition;
            }
            if (filters.language) {
                searchQuery.language = filters.language;
            }
            if (filters.categoryId) {
                searchQuery.categoryId = filters.categoryId;
            }
            if (filters.categorySubId) {
                searchQuery.categorySubId = filters.categorySubId;
            }

            // Price range
            if (filters.price.min !== undefined || filters.price.max !== undefined) {
                searchQuery.price = {};
                if (filters.price.min !== undefined) {
                    searchQuery.price.$gte = filters.price.min;
                }
                if (filters.price.max !== undefined) {
                    searchQuery.price.$lte = filters.price.max;
                }
            }

            console.log('MongoDB Query:', searchQuery); // Debug log

            // Build sort object
            const sortObject = {
                [sort.field]: sort.order === 'asc' ? 1 : -1
            };

            // Execute search query with pagination
            const [products, total] = await Promise.all([
                Product.find(searchQuery)
                    .sort(sortObject)
                    .skip((pagination.page - 1) * pagination.limit)
                    .limit(pagination.limit)
                    .lean(),
                Product.countDocuments(searchQuery)
            ]);

            console.log('Found products:', products.length); // Debug log

            // Get user data
            const userIds = [...new Set(products.map(p => p.userId))];
            const users = await User.find({
                _id: { $in: userIds }
            }).lean();

            const userMap = users.reduce((acc, user) => {
                acc[user._id.toString()] = {
                    id: user._id,
                    name: user.name,
                    email: user.email
                };
                return acc;
            }, {});

            // Format products
            const formattedProducts = products.map(product => ({
                ...product,
                user: userMap[product.userId.toString()] || null,
                userId: undefined
            }));

            return {
                products: formattedProducts,
                total,
                page: pagination.page,
                pages: Math.ceil(total / pagination.limit),
                limit: pagination.limit
            };
        } catch (error) {
            console.error('Search service error:', error); // Debug log
            throw error;
        }
    }
}

module.exports = ProductService;

