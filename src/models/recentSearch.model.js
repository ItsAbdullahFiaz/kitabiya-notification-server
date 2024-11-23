const mongoose = require('mongoose');

const recentSearchSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries and automatic deletion after 30 days
recentSearchSchema.index({ userId: 1, createdAt: -1 });
recentSearchSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('RecentSearch', recentSearchSchema);