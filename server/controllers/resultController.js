const Result = require('../models/resultModel');
const Exam = require('../models/examModel'); // ✅ FIX 1

// Convert seconds → mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}


// @desc    Get logged-in student's exam results (summary only)
// @route   GET /api/results/my-results
// @access  Private (Student)
const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate("exam", "name subject duration totalMarks endTime")
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();

    const formattedResults = results
  .filter((result) => result.exam)
  .map((result) => ({
        resultId: result._id,
        examId: result.exam._id,
        examName: result.exam.name,
        subject: result.exam.subject,
        totalMarks: result.exam.totalMarks,
        endTime: result.exam.endTime,
        duration: result.exam.duration,
        score: result.score,
        percentage: result.percentage,
        status: result.status,
        submittedAt: result.createdAt,
        timeTaken: result.timeTaken
      }));

    return res.status(200).json({
      success: true,
      results: formattedResults
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get detailed results of an exam
// @route   GET /api/results/:examId/detailed
// @access  Private (Admin creator + Owner)
const getDetailedResults = async (req, res) => {
  try {
    const examId = req.params.examId;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // 🔐 Permission Check
    if (req.user.role === "admin") {
      // Admin can only see exams they created
      if (exam.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Not authorized to view detailed results of this exam"
        });
      }
    }

    // Students cannot access
    if (req.user.role === "student") {
      return res.status(403).json({
        message: "Students are not allowed to view detailed results"
      });
    }

    const results = await Result.find({ exam: examId })
      .populate("student", "name email")
      .sort({ score: -1 })
      .lean();

    if (!results.length) {
      return res.status(404).json({
        message: "No results found for this exam"
      });
    }

    const formattedResults = results.map(result => ({
      studentName: result.student.name,
      email: result.student.email,
      score: result.score,
      percentage: result.percentage,
      timeTaken: formatTime(result.timeTaken),
      status: result.status
    }));

    res.json({
      examName: exam.name,
      totalParticipants: results.length,
      results: formattedResults
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed review of a specific result (question-wise)
// @route   GET /api/results/:resultId
// @access  Private (Student - own result only)
const getResultDetails = async (req, res) => {
  try {
    const resultId = req.params.resultId;

    // STEP 1: Replace populate with nested exam.questions population
    const result = await Result.findById(resultId)
      .populate({
        path: "exam",
        select: "name totalMarks duration endTime questions",
        populate: {
          path: "questions",
          select: "questionText options correctOptionIndex"
        }
      })
      .populate("answers.questionId");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found"
      });
    }

    // 🔐 Authorization: Student can only view their own result
    if (result.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this result"
      });
    }

    // 🔐 Time-based Access: Results available only after exam ends
    

    // STEP 2: Build answer lookup map for O(1) access
    const answerMap = {};
    result.answers.forEach(ans => {
      answerMap[ans.questionId._id.toString()] = ans;
    });

    // STEP 3: Map through ALL exam questions (not just answered ones)
    const questions = result.exam.questions.map((examQuestion) => {
      const answer = answerMap[examQuestion._id.toString()];

      if (answer) {
        // Question was attempted
        return {
          questionId: examQuestion._id,
          questionText: examQuestion.questionText,
          options: examQuestion.options,
          selectedOptionIndex: answer.selectedOptionIndex,
          correctOptionIndex: examQuestion.correctOptionIndex,
          isCorrect: answer.isCorrect,
          status: answer.isCorrect ? "correct" : "incorrect"
        };
      }

      // Question was not attempted
      return {
        questionId: examQuestion._id,
        questionText: examQuestion.questionText,
        options: examQuestion.options,
        selectedOptionIndex: null,
        correctOptionIndex: examQuestion.correctOptionIndex,
        isCorrect: false,
        status: "unattempted"
      };
    });

    // Count correct and wrong answers (only from attempted questions)
    const correctAnswers = result.answers.filter(ans => ans.isCorrect).length;
    const attemptedQuestions = result.answers.length;
    const totalQuestions = result.exam.questions.length;
    const unattemptedQuestions = totalQuestions - attemptedQuestions;
    const wrongAnswers = attemptedQuestions - correctAnswers;

    // STEP 4: Return proper counts including attempted/unattempted breakdown
    return res.status(200).json({
      success: true,
      data: {
        examName: result.exam.name,
        totalMarks: result.exam.totalMarks,
        score: result.score,
        percentage: result.percentage,
        status: result.status,
        timeTaken: result.timeTaken,
        totalQuestions,
        attemptedQuestions,
        unattemptedQuestions,
        correctAnswers,
        wrongAnswers,
        submittedAt: result.createdAt,
        questions
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getMyResults, getDetailedResults, getResultDetails };
