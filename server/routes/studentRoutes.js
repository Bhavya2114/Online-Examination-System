const express = require("express");
const router = express.Router();
const {
  getStudentDashboard,
  getStudentRecentResults
} = require("../controllers/studentController");
const { getStudentDashboardExams } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, getStudentDashboard);
router.get("/dashboard/exams", protect, getStudentDashboardExams);
router.get("/dashboard/recent-results", protect, getStudentRecentResults);


module.exports = router;
