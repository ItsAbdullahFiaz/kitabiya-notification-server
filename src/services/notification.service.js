const admin = require('firebase-admin');

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
}

module.exports = NotificationService;