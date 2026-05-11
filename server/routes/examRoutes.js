const express = require('express');
const router = express.Router();
const { createExam, getAllExams, startExam, getExamAttempt, getExamById, submitExam , completeExam, updateExam, deleteExam, addQuestionsToExam, getLiveExams, getDashboardSummaryExams } = require('../controllers/examController');
const { protect, admin , studentOnly , authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, admin, createExam);
router.get('/', protect, getAllExams);
router.get('/live', protect, authorizeRoles('admin', 'owner'), getLiveExams);
router.get('/dashboard-summary', protect, authorizeRoles('admin', 'owner'), getDashboardSummaryExams);
router.get('/:id', protect, getExamById);
router.post('/:id/start', protect, studentOnly, startExam);
router.get('/:id/attempt', protect, studentOnly, getExamAttempt);
router.post('/:id/submit', protect, submitExam);
router.put('/:id/add-questions', protect, admin, addQuestionsToExam);

router.patch(
  '/:id/complete',
  protect,
  authorizeRoles('admin', 'owner'),
  completeExam
);

router.put(
  '/:id',
  protect,
  authorizeRoles('admin', 'owner'),
  updateExam
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('admin', 'owner'),
  deleteExam
);



module.exports = router;