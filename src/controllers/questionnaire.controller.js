const QuestionnaireService = require('../services/questionnaire.service');
const logger = require('../utils/logger');

class QuestionnaireController {
    static async submitQuestionnaire(req, res, next) {
        try {
            const userId = req.mongoUser._id;
            const questionnaireData = {
                profession: req.body.profession,
                booksInterest: req.body.booksInterest,
                ageRange: req.body.ageRange,
                city: req.body.city
            };

            const questionnaire = await QuestionnaireService.submitQuestionnaire(userId, questionnaireData);

            res.status(200).json({
                success: true,
                message: 'Questionnaire submitted successfully',
                data: questionnaire
            });
        } catch (error) {
            logger.error('Error in submitQuestionnaire:', error);
            next(error);
        }
    }

    static async getQuestionnaire(req, res, next) {
        try {
            const userId = req.mongoUser._id;
            const questionnaire = await QuestionnaireService.getQuestionnaire(userId);

            res.status(200).json({
                success: true,
                data: questionnaire
            });
        } catch (error) {
            logger.error('Error in getQuestionnaire:', error);
            next(error);
        }
    }
}

module.exports = QuestionnaireController; 