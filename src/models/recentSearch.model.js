const mongoose = require('mongoose');

const recentSearchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for faster queries
recentSearchSchema.index({ userId: 1, createdAt: -1 });

const RecentSearch = mongoose.model('RecentSearch', recentSearchSchema);
module.exports = RecentSearch;