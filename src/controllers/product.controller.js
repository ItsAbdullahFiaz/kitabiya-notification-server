const ProductService = require('../services/product.service');
const UserService = require('../services/user.service');
const logger = require('../utils/logger');
const { productSchema } = require('../validations/product.schema');
const mongoose = require('mongoose');

class ProductController {
    static async createProduct(req, res, next) {
        try {
            // Check if files were uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'At least one image is required'
                });
            }

            const productData = {
                userId: req.body.userId,
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
                productData.userId,
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
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const products = await ProductService.getUserProducts(userId);
            res.status(200).json(products);
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
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const product = await ProductService.deleteProduct(productId, userId);
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
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
            const sort = req.query.sort || '-createdAt';

            const result = await ProductService.getAllProducts({
                page,
                limit,
                sort
            });

            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                data: result.products,
                pagination: {
                    total: result.total,
                    page: result.page,
                    pages: result.pages,
                    limit
                }
            });
        } catch (error) {
            logger.error('Error in getAllProducts:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: 'Error retrieving products'
            });
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

    static async getRecentSearches(req, res) {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'User ID is required'
                });
            }

            const recentSearches = await ProductService.getRecentSearches(userId);

            return res.status(200).json({
                success: true,
                data: recentSearches,
                message: 'Recent searches retrieved successfully'
            });
        } catch (error) {
            logger.error('Error getting recent searches:', error);
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: error.message || 'Error retrieving recent searches'
            });
        }
    }

    static async addToRecentSearches(req, res) {
        try {
            const { userId, productId } = req.body;

            if (!userId || !productId) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'User ID and Product ID are required'
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
            const { userId } = req.query;
            logger.info('Attempting to clear recent searches for user:', userId);

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'User ID is required'
                });
            }

            const result = await ProductService.clearRecentSearches(userId);

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

    static async getPopularProducts(req, res) {
        try {
            logger.info('Getting popular products');
            const limit = parseInt(req.query.limit) || 10;

            const products = await ProductService.getPopularProducts(limit);

            return res.status(200).json({
                success: true,
                data: products,
                message: 'Popular products retrieved successfully'
            });
        } catch (error) {
            logger.error('Error getting popular products:', error);
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: 'Error retrieving popular products'
            });
        }
    }

    static async reportProduct(req, res) {
        try {
            const { productId } = req.params;
            const { userId, reason, description } = req.body;

            // Validate input
            if (!userId || !reason || !description) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'User ID, reason and description are required'
                });
            }

            // Validate reason
            const validReasons = ['inappropriate', 'spam', 'fake', 'offensive', 'other'];
            if (!validReasons.includes(reason)) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid reason provided'
                });
            }

            const report = await ProductService.reportProduct({
                productId,
                userId,
                reason,
                description
            });

            return res.status(201).json({
                success: true,
                data: report,
                message: 'Product reported successfully'
            });
        } catch (error) {
            logger.error('Error reporting product:', error);

            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: error.message
                });
            }

            if (error.message === 'You have already reported this product') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: 'Error reporting product'
            });
        }
    }

    static async getProductReports(req, res) {
        try {
            const { productId } = req.params;
            const reports = await ProductService.getProductReports(productId);

            return res.status(200).json({
                success: true,
                data: reports,
                message: 'Product reports retrieved successfully'
            });
        } catch (error) {
            logger.error('Error getting product reports:', error);
            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: 'Error retrieving product reports'
            });
        }
    }

    static async updateReportStatus(req, res) {
        try {
            const { reportId } = req.params;
            const { status, adminComment, adminId } = req.body;

            // Validate input
            if (!status || !adminId) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Status and admin ID are required'
                });
            }

            // Validate status
            const validStatuses = ['pending', 'reviewed', 'resolved'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid status provided'
                });
            }

            const updatedReport = await ProductService.updateReportStatus(reportId, {
                status,
                adminComment,
                adminId
            });

            return res.status(200).json({
                success: true,
                data: updatedReport,
                message: 'Report status updated successfully'
            });
        } catch (error) {
            logger.error('Error updating report status:', error);

            if (error.message === 'Report not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: error.message
                });
            }

            if (error.message === 'Invalid status provided') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Server Error',
                message: 'Error updating report status'
            });
        }
    }
}

module.exports = ProductController;
