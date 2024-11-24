const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        default: {}
    },
    sentBy: {
        type: String,  // Admin ID who sent the broadcast
        required: true
    },
    messageId: String, // FCM message ID
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Broadcast', broadcastSchema);