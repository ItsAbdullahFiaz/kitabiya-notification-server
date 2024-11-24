const admin = require('firebase-admin');
const User = require('../models/user.model');

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

        // Find user by either firebaseId or email
        let mongoUser = await User.findOne({
            $or: [
                { firebaseId: decodedToken.user_id },
                { email: decodedToken.email }
            ]
        });

        if (!mongoUser) {
            // Only create if user doesn't exist
            mongoUser = await User.create({
                firebaseId: decodedToken.user_id,
                email: decodedToken.email,
                name: decodedToken.email.split('@')[0],
                isAdmin: false
            });
        } else if (!mongoUser.firebaseId) {
            // Update firebaseId if it's missing (for existing email users)
            mongoUser.firebaseId = decodedToken.user_id;
            await mongoUser.save();
        }

        // Set both Firebase and MongoDB user in request
        req.user = decodedToken;
        req.mongoUser = mongoUser;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        // Handle specific errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
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