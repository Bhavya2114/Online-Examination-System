const express = require('express');
const router = express.Router();
const { addQuestion , getAllQuestions, deleteQuestion, updateQuestion } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Only Admins can create questions
router.post('/', protect, admin, addQuestion);
router.get('/', protect, admin, getAllQuestions);
router.delete('/:id', protect, admin, deleteQuestion);
router.put('/:id', protect, admin, updateQuestion);

module.exports = router;