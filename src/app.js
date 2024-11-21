const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { initializeFirebase } = require('./config/firebase.config');
const connectDB = require('./config/db.config');
const config = require('./config/app.config');
const swaggerSpec = require('./docs/swagger');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');
const { initializeCloudinary } = require('./config/cloudinary.config');

const app = express();

// Initialize Firebase
initializeFirebase();

// Initialize Cloudinary
initializeCloudinary();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Add Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Add before routes
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Mount all routes under /api
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Error handling for file uploads
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'File size cannot exceed 5MB'
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        });
    }
    next(err);
});

// Debug middleware (temporary)
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Registered Routes:', app._router.stack
        .filter(r => r.route)
        .map(r => `${Object.keys(r.route.methods)} ${r.route.path}`));
    next();
});

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start server
        app.listen(config.port, '0.0.0.0', () => {
            console.log(`
🚀 Server running in ${config.nodeEnv} mode on port ${config.port}
📚 API Documentation: http://localhost:${config.port}/api-docs
            `);
            logger.info(`Server running on port ${config.port}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        logger.error('Server initialization failed:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;