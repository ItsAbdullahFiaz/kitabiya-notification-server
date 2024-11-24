const mongoose = require('mongoose');
const Product = require('../models/product.model');
const logger = require('../utils/logger');
const User = require('../models/user.model');

const ownerAuthMiddleware = async (req, res, next) => {
    try {
        const productId = req.params.id || req.params.productId;
        const firebaseUid = req.user.uid;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                error: 'Invalid ID',
                message: 'Invalid product ID format'
            });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Product not found'
            });
        }

        if (product.userId.toString() !== user._id.toString()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to modify this product'
            });
        }

        req.mongoUser = user;
        next();
    } catch (error) {
        logger.error('Owner authentication error:', error);
        next(error);
    }
};

module.exports = ownerAuthMiddleware;