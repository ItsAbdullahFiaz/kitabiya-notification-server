const Questionnaire = require('../models/questionnaire.model');
const logger = require('../utils/logger');

class QuestionnaireService {
    static async submitQuestionnaire(userId, data) {
        try {
            const questionnaire = await Questionnaire.findOneAndUpdate(
                { userId },
                {
                    userId,
                    profession: data.profession,
                    booksInterest: data.booksInterest,
                    ageRange: data.ageRange,
                    city: data.city
                },
                { upsert: true, new: true }
            );

            return questionnaire;
        } catch (error) {
            logger.error('Error in submitQuestionnaire:', error);
            throw error;
        }
    }

    static async getQuestionnaire(userId) {
        try {
            const questionnaire = await Questionnaire.findOne({ userId });
            return questionnaire;
        } catch (error) {
            logger.error('Error in getQuestionnaire:', error);
            throw error;
        }
    }

    static async hasCompletedQuestionnaire(userId) {
        try {
            const questionnaire = await Questionnaire.findOne({ userId });
            return !!questionnaire;
        } catch (error) {
            logger.error('Error in hasCompletedQuestionnaire:', error);
            throw error;
        }
    }
}

module.exports = QuestionnaireService; 