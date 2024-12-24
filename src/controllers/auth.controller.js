const admin = require('firebase-admin');
const logger = require('../utils/logger');
const UserService = require('../services/user.service');
const User = require('../models/user.model');
const QuestionnaireService = require('../services/questionnaire.service');

class AuthController {
    static async login(req, res, next) {
        try {
            // Get token from header
            const token = req.headers.authorization?.split('Bearer ')[1];
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            // Verify token
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Get Firebase user details
            const firebaseUser = await admin.auth().getUser(decodedToken.uid);

            // Find or create user in MongoDB
            let mongoUser = await User.findOne({
                $or: [
                    { firebaseId: decodedToken.uid },
                    { email: decodedToken.email }
                ]
            });

            if (!mongoUser) {
                // Create new user
                mongoUser = await User.create({
                    firebaseId: decodedToken.uid,
                    firebaseUid: decodedToken.uid,
                    email: decodedToken.email || firebaseUser.email,
                    name: firebaseUser.displayName || decodedToken.email?.split('@')[0],
                    provider: firebaseUser.providerData[0]?.providerId || 'unknown',
                    isAdmin: false
                });
                logger.info('New user created:', { userId: mongoUser._id });
            }

            // Check questionnaire status
            const hasCompletedQuestionnaire = await QuestionnaireService.hasCompletedQuestionnaire(mongoUser._id);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        _id: mongoUser._id,
                        firebaseId: mongoUser.firebaseId,
                        email: mongoUser.email,
                        name: mongoUser.name,
                        photoUrl: mongoUser.photoUrl,
                        location: mongoUser.location,
                        dateOfBirth: mongoUser.dateOfBirth,
                        isAdmin: mongoUser.isAdmin,
                        hasCompletedQuestionnaire,
                        createdAt: mongoUser.createdAt,
                        updatedAt: mongoUser.updatedAt
                    }
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
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
                        photoUrl: user.photoUrl,
                        location: user.location,
                        dateOfBirth: user.dateOfBirth,
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