const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    profession: {
        type: String,
        required: true
    },
    booksInterest: [{
        type: String,
        required: true
    }],
    ageRange: {
        type: String,
        required: true,
        enum: ['13-17', '18-24', '25-34', '35-44', '45-54', '55+']
    },
    city: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);
module.exports = Questionnaire; 