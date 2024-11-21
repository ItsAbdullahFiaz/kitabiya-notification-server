const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');

class NotificationController {
    static async sendNotification(req, res, next) {
        try {
            const { token, title, body, data } = req.body;
            logger.info('Received notification request', { token, title });

            if (!token) {
                logger.warn('No token provided');
                return res.status(400).json({ error: 'FCM token is required' });
            }

            const response = await NotificationService.sendNotification(token, title, body, data);
            logger.info('Successfully sent notification', { messageId: response });

            return res.status(200).json({ success: true, messageId: response });
        } catch (error) {
            if (error.code === 'messaging/registration-token-not-registered') {
                logger.warn('Invalid token', { token });
                return res.status(404).json({
                    error: 'FCM token is invalid or expired',
                    code: error.code
                });
            }
            next(error);
        }
    }

    static async broadcastToAll(req, res, next) {
        try {
            const { title, body, data } = req.body;
            logger.info('Received broadcast request', { title });

            if (!title || !body) {
                logger.warn('Missing required fields');
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Title and body are required'
                });
            }

            const response = await NotificationService.broadcastToAll(title, body, data);
            logger.info('Successfully sent broadcast', { messageId: response });

            return res.status(200).json({
                success: true,
                message: 'Broadcast sent successfully',
                messageId: response
            });
        } catch (error) {
            logger.error('Error in broadcast controller:', error);
            next(error);
        }
    }
}

module.exports = NotificationController;