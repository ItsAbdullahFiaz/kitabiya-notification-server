const Product = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

class ProductService {
    static async createProduct(userId, productData, images) {
        const imageUrls = await Promise.all(
            images.map(image =>
                cloudinary.uploader.upload(image.path, {
                    folder: 'products'
                })
            )
        );

        const product = new Product({
            ...productData,
            userId,
            images: imageUrls.map(img => img.secure_url)
        });

        return await product.save();
    }

    static async getAllProducts(query = {}) {
        return await Product.find(query)
            .sort({ createdAt: -1 })
            .lean();
    }

    static async getUserProducts(userId) {
        return await Product.find({ userId })
            .sort({ createdAt: -1 })
            .lean();
    }

    static async getProductById(productId, userId) {
        return await Product.findOne({
            _id: productId,
            userId
        }).lean();
    }

    static async deleteProduct(productId, userId) {
        return await Product.findOneAndDelete({
            _id: productId,
            userId
        });
    }
}

module.exports = ProductService;
