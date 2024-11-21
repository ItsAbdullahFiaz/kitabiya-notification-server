const logger = require('../utils/logger');
const config = require('../config/app.config');

const errorHandler = (err, req, res, next) => {
    logger.error('Error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        path: req.path,
        method: req.method,
        body: req.body,
        files: req.files
    });

    res.status(err.status || 500).json({
        error: err.message,
        code: err.code,
        details: config.nodeEnv === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;