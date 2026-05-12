const Result = require('../models/resultModel');
const User = require('../models/userModel');
const Exam = require('../models/examModel');
const ExamSession = require('../models/examSessionModel');

// @desc    Get Student Dashboard Data
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1️⃣ Aggregate student performance
    const stats = await Result.aggregate([
      {
        $match: { student: studentId }
      },
      {
        $group: {
          _id: "$student",
          totalExams: { $sum: 1 },
          averageScore: { $avg: "$percentage" },
          highestScore: { $max: "$percentage" },
          passedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Passed"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const dashboardStats = stats.length > 0 ? stats[0] : {
      totalExams: 0,
      averageScore: 0,
      highestScore: 0,
      passedCount: 0
    };

    // 2️⃣ Get user info
    const user = await User.findById(studentId).select(
      "name email role userIdNumber"
    );

    res.status(200).json({
      studentId: user.userIdNumber,
      name: user.name,
      email: user.email,
      role: user.role,
      totalExams: dashboardStats.totalExams,
      averageScore: Number(dashboardStats.averageScore || 0).toFixed(2),
      highestScore: Number(dashboardStats.highestScore || 0).toFixed(2),
      passedExams: dashboardStats.passedCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin/Owner)
const getAdminDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    console.log('📊 Dashboard Stats Query - Current Time:', now.toISOString());

    // Time-based filtering with question validation
    const totalExams = await Exam.countDocuments({});
    
    // Active exams: startTime <= now <= endTime AND has questions
    const activeExams = await Exam.countDocuments({
      startTime: { $lte: now },
      endTime: { $gte: now },
      'questions.0': { $exists: true } // Must have at least one question
    });
    
    // Completed exams: endTime < now AND has questions
    const completedExams = await Exam.countDocuments({
      endTime: { $lt: now },
      'questions.0': { $exists: true } // Must have at least one question
    });

    console.log('📈 Stats:', {
      total: totalExams,
      active: activeExams,
      completed: completedExams
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const uniqueStudents = await ExamSession.distinct(
  "student",
  {
    createdAt: {
      $gte: todayStart,
      $lte: todayEnd
    }
  }
);

const studentsAttemptedToday =
  uniqueStudents.length;

    res.status(200).json({
      totalExams,
      activeExams,
      completedExams,
      studentsAttemptedToday
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Active Exams for Student Dashboard
// @route   GET /api/student/dashboard/exams
// @access  Private (Student)
const getStudentDashboardExams = async (req, res) => {
  try {
    const now = new Date();
    const studentId = req.user._id;

    // Active exams
    const exams = await Exam.find({
      status: "active",
      startTime: { $lte: now },
      endTime: { $gte: now },
      "questions.0": { $exists: true },
    })
      .select(
        "_id name subject duration totalMarks passingMarks startTime endTime"
      )
      .lean();

    // Student results
    const studentResults = await Result.find({
      student: studentId,
    }).select("exam");

    // Create completed exam ID set
    const completedExamIds = new Set(
      studentResults.map((result) => result.exam.toString())
    );

    // Add attempted flag
    const examsWithStatus = exams
  .map((exam) => ({
    ...exam,
    isAttempted: completedExamIds.has(exam._id.toString()),
  }))
  .sort((a, b) => {
    // Active exams first
    if (a.isAttempted === b.isAttempted) return 0;

    return a.isAttempted ? 1 : -1;
  });

    res.status(200).json(examsWithStatus);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  getStudentDashboard,
  getAdminDashboardStats,
  getStudentDashboardExams,
};