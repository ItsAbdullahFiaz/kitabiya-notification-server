const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    categoryId: {
        type: String,
        required: true
    },
    categorySubId: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    locationLatitude: {
        type: Number,
        required: true
    },
    locationLongitude: {
        type: Number,
        required: true
    },
    locationAddress: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    views: {
        type: Number,
        default: 0,
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
