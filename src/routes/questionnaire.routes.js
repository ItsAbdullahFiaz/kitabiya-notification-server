const express = require('express');
const QuestionnaireController = require('../controllers/questionnaire.controller');
const auth = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/', auth, QuestionnaireController.submitQuestionnaire);
router.get('/', auth, QuestionnaireController.getQuestionnaire);

module.exports = router; 