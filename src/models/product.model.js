const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [String],
    category: {
        id: { type: String, required: true },
        subCategoryId: { type: String, required: true }
    },
    condition: { type: String, required: true },
    type: { type: String, required: true },
    language: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String, required: true }
    },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
