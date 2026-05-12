const ExamResult = require("../models/resultModel");
const Exam = require("../models/examModel");

const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user._id;

        // 1️⃣ Get all results for the student  
        let results = [];
        try {
            results = await ExamResult.find({ student: studentId });
        } catch (error) {
            console.error("Error fetching exam results:", error.message);
        }

        // 2️⃣ Calculate completed exams
        const completedExams = results.length;

        // 3️⃣ Calculate average score
        let averageScore = 0;
        if (results.length > 0) {
            const avgScoreData = await ExamResult.aggregate([
                { $match: { student: studentId } },
                {
                    $group: {
                        _id: null,
                        averageScore: { $avg: "$percentage" }
                    }
                }
            ]);
            averageScore = avgScoreData.length > 0 ? parseFloat(avgScoreData[0].averageScore).toFixed(2) : 0;
        }

        // 4️⃣ Calculate total hours from timeTaken (convert seconds to hours)
        const totalSeconds = results.reduce((sum, result) => sum + (result.timeTaken || 0), 0);
        const totalHours = (totalSeconds / 3600).toFixed(2);

        // 5️⃣ Get active exams count
        let activeExams = 0;
        try {
            const now = new Date();
            
            activeExams = await Exam.countDocuments({
                status: "active",
                startTime: { $lte: now },
                endTime: { $gte: now },
                "questions.0": { $exists: true }
            });
        } catch (error) {
            console.error("Error fetching active exams:", error.message);
            activeExams = 0;
        }

        res.status(200).json({
            activeExams,
            completedExams,
            averageScore: parseFloat(averageScore),
            totalHours: parseFloat(totalHours)
        });

    } catch (error) {
        console.error("Dashboard error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's recent results (latest 5)
// @route   GET /api/student/dashboard/recent-results
// @access  Private (Student)
const getStudentRecentResults = async (req, res) => {
  try {
    const studentId = req.user._id;

    const now = new Date();

    const recentResults = await ExamResult.find({
      student: studentId,
    })
      .populate("exam", "name endTime")
      .select("_id percentage createdAt exam")
      .sort({ createdAt: -1 })
      .lean();

    // Filter ONLY ended exams
    const filteredResults = recentResults
      .filter((result) => {
        if (!result.exam) return false;

        return new Date(result.exam.endTime) <= now;
      })
      .slice(0, 3);

    const formattedResults = filteredResults.map((result) => ({
      _id: result._id,
      percentage: Number(result.percentage.toFixed(1)),
      createdAt: result.createdAt,
      exam: result.exam,
    }));

    res.status(200).json(formattedResults);

  } catch (error) {
    console.error(
      "Error fetching recent results:",
      error.message
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { getStudentDashboard, getStudentRecentResults };