const express = require('express');
const productRoutes = require('./product.routes');
const notificationRoutes = require('./notification.routes');
const userRoutes = require('./user.routes');
const logger = require('../utils/logger');

const router = express.Router();

// Log all API requests
router.use(logger.httpRequest);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Kitabya Backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Mount routes
router.use('/v1/products', productRoutes);
router.use('/v1/notifications', notificationRoutes);
router.use('/v1/users', userRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist'
    });
});

module.exports = router;

