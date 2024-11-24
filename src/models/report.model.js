const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    userId: {
        type: String,
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
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    },
    adminComment: {
        type: String,
        trim: true
    },
    reviewedBy: {
        type: String  // Admin ID who reviewed the report
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index to prevent multiple reports from same user for same product
reportSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);