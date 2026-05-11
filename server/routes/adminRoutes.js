const express = require('express');
const router = express.Router();
const { getAdminDashboardStats } = require('../controllers/dashboardController');
const {
	getAdminResultsSummary,
	getAdminExamResults,
	getAdminResultsStats
} = require('../controllers/adminResultsController');
const { protect, admin, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, admin, getAdminDashboardStats);

router.get(
	'/results/summary',
	protect,
	authorizeRoles('admin', 'owner'),
	getAdminResultsSummary
);

router.get(
	'/results/:examId',
	protect,
	authorizeRoles('admin', 'owner'),
	getAdminExamResults
);

router.get(
	'/results/stats',
	protect,
	authorizeRoles('admin', 'owner'),
	getAdminResultsStats
);

module.exports = router;
