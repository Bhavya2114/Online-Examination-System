const express = require('express');
const router = express.Router();
const { getMyResults, getDetailedResults, getResultDetails } = require('../controllers/resultController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/my-results', protect, getMyResults);
router.get('/:resultId', protect, getResultDetails);

router.get(
  '/:examId/detailed-results',
  protect,
  authorizeRoles('admin', 'owner'),
  getDetailedResults
);

module.exports = router;