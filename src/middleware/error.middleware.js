const logger = require('../utils/logger');
const config = require('../config/app.config');

const errorHandler = (err, req, res, next) => {
    logger.error('Error occurred:', err);

    res.status(500).json({
        error: err.message,
        code: err.code,
        stack: config.nodeEnv === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;