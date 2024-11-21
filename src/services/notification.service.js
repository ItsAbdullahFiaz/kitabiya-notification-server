const admin = require('firebase-admin');
const logger = require('../utils/logger');

class NotificationService {
    static async sendNotification(token, title, body, data) {
        const message = {
            token,
            notification: { title, body },
            data: Object.fromEntries(
                Object.entries(data || {}).map(([key, value]) => [key, String(value)])
            ),
            android: {
                priority: 'high',
                notification: {
                    channelId: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                },
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                        badge: 1,
                        sound: 'default',
                    },
                },
            },
        };

        return admin.messaging().send(message);
    }

    static async broadcastToAll(title, body, data) {
        try {
            if (!title || !body) {
                throw new Error('Title and body are required for broadcast');
            }

            const message = {
                notification: {
                    title,
                    body
                },
                topic: 'all-users',
                data: data ? Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [key, String(value)])
                ) : undefined,
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'default'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            badge: 1,
                            sound: 'default'
                        }
                    }
                }
            };

            logger.info('Sending broadcast notification:', { title, body });
            const response = await admin.messaging().send(message);
            logger.info('Broadcast sent successfully:', response);

            return response;
        } catch (error) {
            logger.error('Error sending broadcast:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;