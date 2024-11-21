const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase.config');
const connectDB = require('./config/db.config');
const config = require('./config/app.config');
const swaggerSpec = require('./docs/swagger');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');
const productRoutes = require('./routes/product.routes');

const app = express();

// Initialize Firebase
initializeFirebase();

// Add Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Kitabya Backend is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api', routes);
app.use('/api/v1/products', productRoutes);

// Error handling
app.use(errorHandler);

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