const express = require('express');
const productRoutes = require('./product.routes');
const notificationRoutes = require('./notification.routes');
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const authMiddleware = require('../middleware/auth.middleware');
const adminAuthMiddleware = require('../middleware/adminAuth.middleware');
const logger = require('../utils/logger');

const router = express.Router();

// Log all API requests
router.use(logger.httpRequest);

// Public routes
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Kitabya Backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Authentication routes (public)
router.use('/v1/auth', authRoutes);
router.use('/v1/users/register', userRoutes);

// Protected routes - require authentication
router.use('/v1/products', authMiddleware, productRoutes);
router.use('/v1/users', authMiddleware, userRoutes);

// Split notification routes
// Public routes (require only auth)
router.use('/v1/notifications/send', authMiddleware, notificationRoutes);
router.use('/v1/notifications/broadcasts', authMiddleware, notificationRoutes);

// Admin-only routes
router.use('/v1/notifications/broadcast', authMiddleware, adminAuthMiddleware, notificationRoutes);

// 404 handler
router.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist'
    });
});

module.exports = router;

