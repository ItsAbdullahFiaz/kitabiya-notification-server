const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    },
    adminComment: String,
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date
}, {
    timestamps: true
});

// Compound indexes for better query performance
reportSchema.index({ productId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;