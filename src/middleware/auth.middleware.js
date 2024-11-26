const admin = require('firebase-admin');
const User = require('../models/user.model');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
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
                firebaseUid: decodedToken.uid, // Add this field for consistency
                email: decodedToken.email,
                name: firebaseUser.displayName || decodedToken.email.split('@')[0],
                provider: firebaseUser.providerData[0]?.providerId || 'unknown',
                isAdmin: false
            });
            logger.info('New user created:', { userId: mongoUser._id });
        } else if (!mongoUser.firebaseId) {
            // Update existing user with firebaseId if missing
            mongoUser.firebaseId = decodedToken.uid;
            mongoUser.firebaseUid = decodedToken.uid;
            await mongoUser.save();
            logger.info('Updated user with firebaseId:', { userId: mongoUser._id });
        }

        // Set both Firebase and MongoDB user in request
        req.user = decodedToken;
        req.mongoUser = mongoUser;
        next();
    } catch (error) {
        logger.error('Auth middleware error:', error);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                error: error.code
            });
        }

        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

module.exports = auth;