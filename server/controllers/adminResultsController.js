const Result = require('../models/resultModel');

// @desc    Get exam-wise results summary for admin
// @route   GET /api/admin/results/summary
// @access  Private (Admin/Owner)
const getAdminResultsSummary = async (req, res) => {
  try {
    const summary = await Result.aggregate([
      {
        $group: {
          _id: '$exam',
          totalAttempts: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' },
          passCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Passed'] }, 1, 0]
            }
          },
          failCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'exams',
          localField: '_id',
          foreignField: '_id',
          as: 'exam'
        }
      },
      {
        $unwind: {
          path: '$exam',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          examId: '$_id',
          examTitle: '$exam.name',
          totalAttempts: 1,
          averagePercentage: {
            $round: ['$averagePercentage', 1]
          },
          passCount: 1,
          failCount: 1
        }
      }
    ]);

    return res.status(200).json(summary || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed results for a specific exam (admin)
// @route   GET /api/admin/results/:examId
// @access  Private (Admin/Owner)
const getAdminExamResults = async (req, res) => {
  try {
    const examId = req.params.examId;

    const results = await Result.find({ exam: examId })
      .populate('student', 'name email')
      .sort({ percentage: -1 })
      .select('score percentage status timeTaken createdAt student')
      .lean();

    const formattedResults = results.map((result) => ({
      studentName: result.student?.name || 'Unknown',
      email: result.student?.email || 'Unknown',
      score: result.score,
      percentage: result.percentage,
      status: result.status,
      timeTaken: result.timeTaken,
      createdAt: result.createdAt
    }));

    return res.status(200).json(formattedResults || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform-wide admin results stats
// @route   GET /api/admin/results/stats
// @access  Private (Admin/Owner)
const getAdminResultsStats = async (req, res) => {
  try {
    const totalSubmissions = await Result.countDocuments();
    const distinctExams = await Result.distinct('exam');
    const totalExamsConducted = distinctExams.length;

    const aggregate = await Result.aggregate([
      {
        $group: {
          _id: null,
          averagePercentage: { $avg: '$percentage' },
          passCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Passed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const avg = aggregate.length > 0 ? aggregate[0].averagePercentage : 0;
    const passCount = aggregate.length > 0 ? aggregate[0].passCount : 0;
    const overallPassRate = totalSubmissions > 0
      ? (passCount / totalSubmissions) * 100
      : 0;

    return res.status(200).json({
      totalExamsConducted,
      totalSubmissions,
      platformAveragePercentage: Number(avg.toFixed(1)),
      overallPassRate: Number(overallPassRate.toFixed(1))
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminResultsSummary,
  getAdminExamResults,
  getAdminResultsStats
};
