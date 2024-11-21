const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Handle duplicate email errors
userSchema.post('save', function (error, doc, next) {
    if (error.code === 11000) {
        next(new Error('Email already exists'));
    } else {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);
