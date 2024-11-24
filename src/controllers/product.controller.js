const ProductService = require('../services/product.service');
const UserService = require('../services/user.service');
const logger = require('../utils/logger');
const { productSchema } = require('../validations/product.schema');
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const RecentSearch = require('../models/recentSearch.model');
const User = require('../models/user.model');
const Report = require('../models/report.model');

class ProductController {
    static async createProduct(req, res, next) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'At least one image is required'
                });
            }

            const productData = {
                userId: req.user.uid,
                title: req.body.title,
                price: Number(req.body.price),
                categoryId: req.body.categoryId,
                categorySubId: req.body.categorySubId,
                condition: req.body.condition,
                type: req.body.type,
                language: req.body.language,
                description: req.body.description,
                locationLatitude: Number(req.body.locationLatitude),
                locationLongitude: Number(req.body.locationLongitude),
                locationAddress: req.body.locationAddress
            };

            const result = await ProductService.createProduct(
                req.user.uid,
                productData,
                req.files
            );

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserProducts(req, res, next) {
        try {
            const products = await ProductService.getUserProducts(req.user.uid);
            res.status(200).json({
                success: true,
                data: products,
                message: 'User products retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async getProduct(req, res, next) {
        try {
            const { productId } = req.params;
            const product = await ProductService.getProductById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    }

    static async deleteProduct(req, res, next) {
        try {
            const { productId } = req.params;
            const product = await ProductService.deleteProduct(productId, req.user.uid);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async getAllProducts(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortBy = req.query.sortBy || 'createdAt';
            const sortOrder = req.query.sortOrder || 'desc';

            const skip = (page - 1) * limit;
            const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

            const [products, total] = await Promise.all([
                Product.find()
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'name email')
                    .lean(),
                Product.countDocuments()
            ]);

            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                data: {
                    products,
                    pagination: {
                        current: page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getProductById(req, res, next) {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'Invalid product ID format'
                });
            }

            const product = await ProductService.getProductById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Product not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product retrieved successfully',
                data: product
            });
        } catch (error) {
            logger.error('Error in getProductById:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: 'Error retrieving product'
            });
        }
    }

    static async getProductsByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'Invalid user ID format'
                });
            }

            const result = await ProductService.getProductsByUser({
                userId,
                page: parseInt(page),
                limit: parseInt(limit),
                sort
            });

            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                data: result.products,
                pagination: {
                    total: result.total,
                    page: result.page,
                    pages: result.pages
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'Invalid product ID format'
                });
            }

            const result = await ProductService.updateProduct(
                id,
                updateData,
                req.files || []
            );

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Product not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'Invalid product ID format'
                });
            }

            const result = await ProductService.deleteProduct(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Product not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async searchProducts(req, res, next) {
        try {
            const {
                query = '',
                type,
                condition,
                language,
                categoryId,
                categorySubId,
                minPrice,
                maxPrice,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                page = 1,
                limit = 10
            } = req.query;

            console.log('Search criteria:', req.query); // Debug log

            const searchCriteria = {
                query,
                filters: {
                    type,
                    condition,
                    language,
                    categoryId,
                    categorySubId,
                    price: {
                        min: minPrice ? Number(minPrice) : undefined,
                        max: maxPrice ? Number(maxPrice) : undefined
                    }
                },
                sort: {
                    field: sortBy,
                    order: sortOrder
                },
                pagination: {
                    page: Number(page),
                    limit: Number(limit)
                }
            };

            const result = await ProductService.searchProducts(searchCriteria);

            res.status(200).json({
                success: true,
                message: 'Search results retrieved successfully',
                data: result.products,
                pagination: {
                    total: result.total,
                    page: result.page,
                    pages: result.pages,
                    limit: result.limit
                }
            });
        } catch (error) {
            console.error('Search error:', error); // Debug log
            next(error);
        }
    }

    static async getRecentSearches(req, res, next) {
        try {
            const userId = req.mongoUser._id;
            const limit = parseInt(req.query.limit) || 10;

            const recentSearches = await RecentSearch.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('productId', 'title images price condition type')
                .lean();

            res.status(200).json({
                success: true,
                message: 'Recent searches retrieved successfully',
                data: recentSearches
            });
        } catch (error) {
            next(error);
        }
    }

    static async addToRecentSearches(req, res) {
        try {
            const { productId } = req.body;
            const userId = req.mongoUser._id;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Product ID is required'
                });
            }

            await ProductService.addToRecentSearches(userId, productId);
            return res.status(200).json({
                success: true,
                message: 'Added to recent searches'
            });
        } catch (error) {
            logger.error('Error adding to recent searches:', error);
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: error.message
            });
        }
    }

    static async clearRecentSearches(req, res) {
        try {
            logger.info('Attempting to clear recent searches for user:', req.user.uid);

            const result = await ProductService.clearRecentSearches(req.user.uid);

            return res.status(200).json({
                success: true,
                message: 'Recent searches cleared successfully',
                count: result.deletedCount
            });
        } catch (error) {
            logger.error('Error clearing recent searches:', error);
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid user ID format'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: error.message || 'Error clearing recent searches'
            });
        }
    }

    static async getPopularProducts(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const products = await ProductService.getPopularProducts(limit);

            res.status(200).json({
                success: true,
                data: products,
                message: 'Popular products retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async reportProduct(req, res, next) {
        try {
            const { productId } = req.params;
            const userId = req.mongoUser._id;
            const { reason, description } = req.body;

            // Validate required fields
            if (!reason || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Reason and description are required'
                });
            }

            // Validate reason
            const validReasons = ['inappropriate', 'spam', 'fake', 'offensive', 'other'];
            if (!validReasons.includes(reason)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reason. Must be one of: ' + validReasons.join(', ')
                });
            }

            // Validate product ID
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Check if user is reporting their own product
            if (product.userId.toString() === userId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot report your own product'
                });
            }

            // Check if user has already reported this product
            const existingReport = await Report.findOne({ userId, productId });
            if (existingReport) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reported this product'
                });
            }

            // Create new report
            const report = await Report.create({
                productId,
                userId,
                reason,
                description,
                status: 'pending'
            });

            res.status(201).json({
                success: true,
                message: 'Product reported successfully',
                data: report
            });
        } catch (error) {
            console.error('Report product error:', error);
            next(error);
        }
    }

    static async getProductReports(req, res, next) {
        try {
            const { productId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Validate product ID
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Calculate skip for pagination
            const skip = (page - 1) * limit;

            // Get reports with pagination
            const [reports, total] = await Promise.all([
                Report.find({ productId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'name email')
                    .lean(),
                Report.countDocuments({ productId })
            ]);

            res.status(200).json({
                success: true,
                message: 'Reports retrieved successfully',
                data: {
                    reports,
                    pagination: {
                        current: page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get product reports error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving product reports',
                error: error.message
            });
        }
    }

    static async updateReportStatus(req, res, next) {
        try {
            const { reportId } = req.params;
            const { status, adminComment } = req.body;
            const adminId = req.mongoUser._id;

            // Validate report ID
            if (!mongoose.Types.ObjectId.isValid(reportId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report ID format'
                });
            }

            // Validate status
            const validStatuses = ['pending', 'reviewed', 'resolved'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            // Find and update the report
            const report = await Report.findById(reportId);

            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found'
                });
            }

            // Update report
            report.status = status;
            report.adminComment = adminComment;
            report.reviewedBy = adminId;
            report.reviewedAt = new Date();

            await report.save();

            // Populate user details
            await report.populate('userId', 'name email');

            res.status(200).json({
                success: true,
                message: 'Report status updated successfully',
                data: report
            });
        } catch (error) {
            console.error('Update report status error:', error);
            next(error);
        }
    }

    static async deleteRecentSearches(req, res, next) {
        try {
            const userId = req.mongoUser._id;

            await RecentSearch.deleteMany({ userId });

            res.status(200).json({
                success: true,
                message: 'Recent searches cleared successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteRecentSearch(req, res, next) {
        try {
            const userId = req.mongoUser._id;
            const searchId = req.params.searchId;

            if (!mongoose.Types.ObjectId.isValid(searchId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid search ID format'
                });
            }

            const result = await RecentSearch.findOneAndDelete({
                _id: searchId,
                userId
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Recent search not found or already deleted'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Recent search deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = { ProductController };
