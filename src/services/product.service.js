const Product = require('../models/product.model');
const User = require('../models/user.model');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const RecentSearch = require('../models/recentSearch.model');
const Report = require('../models/report.model');

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

    static async getProductById(productId) {
        try {
            logger.info('Getting product by ID:', productId);

            // This single operation does two things:
            // 1. Finds the product
            // 2. Increments the views counter
            const product = await Product.findOneAndUpdate(
                { _id: productId },        // Find product by ID
                { $inc: { views: 1 } },    // Increment views by 1
                {
                    new: true,             // Return updated document
                    populate: {            // Include user details
                        path: 'userId',
                        select: 'name email'
                    }
                }
            );

            if (!product) {
                throw new Error('Product not found');
            }

            // Format response
            const formattedProduct = {
                _id: product._id,
                title: product.title,
                price: product.price,
                views: product.views,      // Include view count in response
                user: {
                    id: product.userId._id,
                    name: product.userId.name,
                    email: product.userId.email
                },
                // ... other fields ...
            };

            logger.info(`Product ${productId} viewed. Total views: ${product.views}`);
            return formattedProduct;
        } catch (error) {
            logger.error('Error in getProductById:', error);
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

    static async getRecentSearches(userId) {
        try {
            logger.info('Getting recent searches for user:', userId);

            const searches = await RecentSearch.find({ userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate({
                    path: 'productId',
                    select: 'title images price',
                    model: 'Product'
                })
                .lean();

            // Filter out any searches where product might have been deleted
            const validSearches = searches.filter(search => search.productId);

            logger.info(`Found ${validSearches.length} valid searches`);

            // Format the response
            const formattedSearches = validSearches.map(search => ({
                _id: search._id,
                userId: search.userId,
                product: {
                    _id: search.productId._id,
                    title: search.productId.title,
                    images: search.productId.images,
                    price: search.productId.price
                },
                createdAt: search.createdAt
            }));

            return formattedSearches;
        } catch (error) {
            logger.error('Error in getRecentSearches:', error);
            throw error;
        }
    }

    static async addToRecentSearches(userId, productId) {
        try {
            logger.info('Adding to recent searches:', { userId, productId });

            // Verify product exists
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Check if this combination already exists
            const existingSearch = await RecentSearch.findOne({
                userId,
                productId: new mongoose.Types.ObjectId(productId)
            });

            if (existingSearch) {
                // Update timestamp of existing search
                existingSearch.createdAt = new Date();
                await existingSearch.save();
                logger.info('Updated existing search timestamp');
                return existingSearch;
            }

            // Create new entry if it doesn't exist
            const recentSearch = await RecentSearch.create({
                userId,
                productId: new mongoose.Types.ObjectId(productId),
                createdAt: new Date()
            });

            logger.info('Created new recent search entry');
            return recentSearch;
        } catch (error) {
            logger.error('Error in addToRecentSearches:', error);
            throw error;
        }
    }

    static async clearRecentSearches(userId) {
        try {
            logger.info('Clearing recent searches for user:', userId);

            const result = await RecentSearch.deleteMany({
                userId: userId.toString()
            });

            logger.info(`Cleared ${result.deletedCount} recent searches for user ${userId}`);
            return {
                deletedCount: result.deletedCount
            };
        } catch (error) {
            logger.error('Error in clearRecentSearches:', error);
            throw error;
        }
    }

    static async getPopularProducts(limit = 10) {
        try {
            logger.info(`Getting top ${limit} popular products`);

            // First get products without population
            const products = await Product.find()
                .sort({ views: -1 })
                .limit(limit)
                .lean();

            logger.info(`Found ${products.length} popular products`);

            // Format products without user data first
            const formattedProducts = products.map(product => ({
                _id: product._id,
                title: product.title,
                price: product.price,
                views: product.views || 0,
                images: product.images || [],
                description: product.description,
                condition: product.condition,
                type: product.type,
                language: product.language,
                locationAddress: product.locationAddress,
                userId: product.userId // Keep the original userId
            }));

            // Now try to populate user data separately
            for (let product of formattedProducts) {
                try {
                    if (product.userId) {
                        const user = await User.findById(product.userId)
                            .select('name email')
                            .lean();

                        if (user) {
                            product.user = {
                                id: user._id,
                                name: user.name,
                                email: user.email
                            };
                        }
                    }
                    // Remove the userId from the final response
                    delete product.userId;
                } catch (error) {
                    logger.warn(`Could not populate user for product ${product._id}:`, error);
                    // Continue with next product if one fails
                    continue;
                }
            }

            return formattedProducts;
        } catch (error) {
            logger.error('Error in getPopularProducts:', error);
            throw error;
        }
    }

    static async reportProduct(reportData) {
        try {
            logger.info('Reporting product:', reportData);

            // Check if product exists
            const product = await Product.findById(reportData.productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Check if user has already reported this product
            const existingReport = await Report.findOne({
                userId: reportData.userId,
                productId: reportData.productId
            });

            if (existingReport) {
                throw new Error('You have already reported this product');
            }

            // Create report
            const report = await Report.create({
                productId: reportData.productId,
                userId: reportData.userId,
                reason: reportData.reason,
                description: reportData.description
            });

            logger.info('Product reported successfully');
            return report;
        } catch (error) {
            logger.error('Error in reportProduct:', error);
            throw error;
        }
    }

    static async getProductReports(productId) {
        try {
            const reports = await Report.find({ productId })
                .sort({ createdAt: -1 })
                .lean();

            return reports;
        } catch (error) {
            logger.error('Error in getProductReports:', error);
            throw error;
        }
    }

    static async updateReportStatus(reportId, updateData) {
        try {
            logger.info('Updating report status:', { reportId, updateData });

            // Validate status
            const validStatuses = ['pending', 'reviewed', 'resolved'];
            if (!validStatuses.includes(updateData.status)) {
                throw new Error('Invalid status provided');
            }

            const report = await Report.findById(reportId);

            if (!report) {
                throw new Error('Report not found');
            }

            // Update report
            report.status = updateData.status;
            report.adminComment = updateData.adminComment;
            report.reviewedBy = updateData.adminId;
            report.reviewedAt = new Date();

            await report.save();

            logger.info(`Report ${reportId} status updated to ${updateData.status}`);
            return report;
        } catch (error) {
            logger.error('Error in updateReportStatus:', error);
            throw error;
        }
    }
}

module.exports = ProductService;

