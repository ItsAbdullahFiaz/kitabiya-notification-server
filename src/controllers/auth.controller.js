const admin = require('firebase-admin');
const logger = require('../utils/logger');
const UserService = require('../services/user.service');

class AuthController {
    static async login(req, res, next) {
        try {
            // mongoUser is already set by auth middleware
            const user = req.mongoUser;

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        _id: user._id,
                        firebaseId: user.firebaseId,
                        email: user.email,
                        name: user.name,
                        isAdmin: user.isAdmin,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            next(error);
        }
    }

    static async getMe(req, res, next) {
        try {
            const user = req.mongoUser;

            res.status(200).json({
                success: true,
                message: 'User profile retrieved successfully',
                data: {
                    user: {
                        _id: user._id,
                        firebaseId: user.firebaseId,
                        email: user.email,
                        name: user.name,
                        isAdmin: user.isAdmin,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = { AuthController };