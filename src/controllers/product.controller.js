const ProductService = require('../services/product.service');
const logger = require('../utils/logger');

class ProductController {
    static async createProduct(req, res, next) {
        try {
            const { userId, ...productData } = req.body;
            const images = req.files;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            if (!images || images.length === 0) {
                return res.status(400).json({ error: 'At least one image is required' });
            }

            const product = await ProductService.createProduct(userId, productData, images);
            logger.info('Product created successfully', { productId: product._id, userId });

            res.status(201).json(product);
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
}

module.exports = ProductController;
