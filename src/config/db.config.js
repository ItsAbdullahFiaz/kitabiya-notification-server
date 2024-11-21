const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            dbName: 'kitabya'
        });

        console.log('\x1b[36m%s\x1b[0m', '🌿 MongoDB Connected Successfully!');
        console.log('\x1b[33m%s\x1b[0m', `📡 Connected to: ${conn.connection.host}`);
        console.log('\x1b[32m%s\x1b[0m', `🗄️  Database: ${conn.connection.db.databaseName}`);

        logger.info('MongoDB connected successfully', {
            host: conn.connection.host,
            database: conn.connection.db.databaseName
        });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ MongoDB Connection Error:');
        console.error('\x1b[31m%s\x1b[0m', error.message);
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (error) => {
    console.error('\x1b[31m%s\x1b[0m', '❌ MongoDB Error After Initial Connection:');
    console.error('\x1b[31m%s\x1b[0m', error.message);
    logger.error('MongoDB error after connection:', error);
});

mongoose.connection.on('disconnected', () => {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  MongoDB Disconnected');
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('\x1b[32m%s\x1b[0m', '🔄 MongoDB Reconnected');
    logger.info('MongoDB reconnected');
});

module.exports = connectDB;
