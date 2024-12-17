const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true,
        unique: true
    },
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        required: true,
        default: 'password'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add compound index for better querying
userSchema.index({ firebaseId: 1, email: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
