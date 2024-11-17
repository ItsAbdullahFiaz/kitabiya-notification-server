const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase.config');
const config = require('./config/app.config');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Initialize Firebase
initializeFirebase();

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Notification server is running' });
});

app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, '0.0.0.0', () => {
    logger.info(`Server running on port ${config.port}`);
});

module.exports = app;