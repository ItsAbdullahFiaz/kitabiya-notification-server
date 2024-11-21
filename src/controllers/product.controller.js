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
}

module.exports = ProductController;
