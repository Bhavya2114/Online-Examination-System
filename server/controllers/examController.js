const Exam = require('../models/examModel');
const Result = require('../models/resultModel');
const ExamSession = require('../models/examSessionModel');
const ExamResult = require('../models/ExamResult');


// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private/Admin
const createExam = async (req, res) => {
    try {
        const {
            name,
            duration,
            subject,
            totalMarks,
            passingMarks,
            questions,
            negativeMarking,
            negativeMarksPerQuestion,
            status,
            startTime,
            endTime
        } = req.body;

        // 1️⃣ Basic Required Validation
        if (
            !name ||
            !subject ||
            duration === undefined ||
            totalMarks === undefined ||
            passingMarks === undefined ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                message: 'Please provide all required fields including startTime and endTime'
            });
        }

        // 2️⃣ Type & Range Validation
        if (duration <= 0) {
            return res.status(400).json({
                message: 'Duration must be greater than 0'
            });
        }

        if (totalMarks <= 0) {
            return res.status(400).json({
                message: 'Total marks must be greater than 0'
            });
        }

        // 3️⃣ Logical Validation
        if (passingMarks > totalMarks) {
            return res.status(400).json({
                message: 'Passing marks cannot exceed total marks'
            });
        }

        // 4️⃣ Scheduling Validation
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: 'Invalid date format for startTime or endTime'
            });
        }

        if (end <= start) {
            return res.status(400).json({
                message: 'End time must be after start time'
            });
        }

        // 4️⃣ Questions validation - optional for draft, required for active
        if (status !== 'draft' && (!Array.isArray(questions) || questions.length === 0)) {
            return res.status(400).json({
                message: 'Questions are required for non-draft exams'
            });
        }

        // 5️⃣ Create Exam - Always start as draft
        const examData = {
            name,
            duration,
            subject,
            totalMarks,
            passingMarks,
            negativeMarking: negativeMarking || false,
            negativeMarksPerQuestion: negativeMarksPerQuestion || 0,
            status: 'draft', // Always start as draft
            createdBy: req.user._id,
            startTime: start,
            endTime: end,
            attemptCount: 0 // Initialize attempt count
        };

        // Only add questions if provided
        if (Array.isArray(questions) && questions.length > 0) {
            examData.questions = questions;
        }

        const exam = await Exam.create(examData);

        res.status(201).json(exam);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get all exams (List view)
// @route   GET /api/exams
// @access  Private (Students, Admins, Owner)
// @query   status - optional filter by status (draft, active, completed)
const getAllExams = async (req, res) => {
    try {
        const now = new Date();

        // 🔄 AUTO-UPDATE EXAM STATUS (DATABASE-FIRST LIFECYCLE)
        // Transition: draft → active (when has questions and within time window)
        await Exam.updateMany(
            {
                status: 'draft',
                'questions.0': { $exists: true },  // Has at least 1 question
                startTime: { $lte: now },           // Exam has started
                endTime: { $gte: now }              // Exam hasn't ended yet
            },
            { status: 'active' }
        );

        // Transition: active → completed (when time window has passed)
        await Exam.updateMany(
            {
                status: 'active',
                endTime: { $lt: now }               // Exam time has passed
            },
            { status: 'completed' }
        );

        // Build filter based on optional status query parameter
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const exams = await Exam.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .lean();

        console.log("Exams from DB (before formatting):", exams.length, "exams");

        const formattedExams = await Promise.all(
  exams.map(async (exam) => {
            try {
                // Compute examState automatically based on time
                let examState = "scheduled";

                if (now >= exam.startTime && now <= exam.endTime) {
                  examState = "active";
                }

                if (now > exam.endTime) {
                  examState = "completed";
                }
                

                // Attach examState to exam object
                const examWithState = { ...exam, examState };

                // 👨‍🎓 STUDENT VIEW
                if (req.user.role === 'student') {
                    

                    const existingSession = await ExamSession.findOne({
    student: req.user._id,
    exam: exam._id,
    isSubmitted: true
});

return {
    _id: exam._id,
    name: exam.name,
    duration: exam.duration,
    subject: exam.subject,
    totalMarks: exam.totalMarks,
    startTime: exam.startTime,
    endTime: exam.endTime,
    examState,
    hasSubmitted: !!existingSession
};
                }

                // 👑 OWNER VIEW → always full access
                if (req.user.role === 'owner') {
                    return examWithState;
                }

                // 👑 ADMIN VIEW
                if (req.user.role === 'admin') {

                    // If admin created this exam → full details
                    if (exam.createdBy.toString() === req.user._id.toString()) {
                        return examWithState;
                    }

                    // Other admins → all fields but with examState
                    return {
        _id: exam._id,
        name: exam.name,
        duration: exam.duration,
        subject: exam.subject,
        totalMarks: exam.totalMarks,
        startTime: exam.startTime,
        endTime: exam.endTime,
        examState
    };
                }

                return null;
            } catch (mapError) {
                console.error("Error formatting exam:", exam._id, mapError);
                return null;
            }
        })
);
        console.log("Formatted exams:", formattedExams.filter(Boolean).length, "exams returned");
        res.json(formattedExams.filter(Boolean));

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc    Get exam details
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate({
                path: 'questions',
                select: req.user.role === 'student'
                    ? '-correctOptionIndex'  // hide answers from students
                    : ''                      // admin sees everything
            })
            .lean();

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Students should only access active exams based on time
        if (req.user.role === 'student') {
            const currentTime = new Date();
            if (currentTime < exam.startTime || currentTime > exam.endTime) {
                return res.status(403).json({ message: 'Exam not available' });
            }
        }

        res.json(exam);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Utility shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// @desc    Start an exam
// @route   POST /api/exams/:id/start
// @access  Private/Student
const startExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user._id;
    const currentTime = new Date();

    // ✅ 1️⃣ Find exam with questions
    const exam = await Exam.findById(examId).populate('questions');

    if (!exam) {
      return res.status(404).json({
        message: 'Exam not found'
      });
    }

    // ✅ 2️⃣ Validate exam.status === 'active'
    if (exam.status !== 'active') {
      return res.status(400).json({
        message: `Exam is not active. Current status: ${exam.status}`
      });
    }

    // ✅ 3️⃣ Validate questions exist
    if (!exam.questions || exam.questions.length === 0) {
      return res.status(400).json({
        message: 'Exam has no questions. Cannot start.'
      });
    }

    // ✅ 4️⃣ Validate time window: currentTime between startTime and endTime
    if (currentTime < exam.startTime) {
      return res.status(400).json({
        message: `Exam has not started yet. It will begin at ${exam.startTime.toLocaleString()}`
      });
    }

    if (currentTime > exam.endTime) {
      return res.status(400).json({
        message: 'Exam has ended'
      });
    }

    // ✅ 5️⃣ Check existing session
    let session = await ExamSession.findOne({
      student: studentId,
      exam: examId
    });

    if (session) {
      // Existing session found - validate it
      if (session.isSubmitted) {
        return res.status(400).json({
          message: 'You have already submitted this exam'
        });
      }

      if (currentTime > session.expiresAt) {
        return res.status(400).json({
          message: 'Your exam session has expired'
        });
      }

      // ✅ Session is valid - resume (DO NOT reshuffle)
    } else {
      // ✅ 6️⃣ First time start - create new session
      const attemptStartTime = currentTime;
      let attemptEndTime = new Date(
        attemptStartTime.getTime() + exam.duration * 60 * 1000
      );

      // Cap attempt duration at global exam endTime
      if (attemptEndTime > exam.endTime) {
        attemptEndTime = exam.endTime;
      }

      // Shuffle questions once
      const shuffledQuestions = shuffleArray([...exam.questions]);

      // Store question + option order
      const questionData = shuffledQuestions.map(q => {
        const optionIndexes = q.options.map((_, index) => index);
        const shuffledOptionIndexes = shuffleArray([...optionIndexes]);

        return {
          questionId: q._id,
          optionOrder: shuffledOptionIndexes
        };
      });

      session = await ExamSession.create({
        student: studentId,
        exam: examId,
        startedAt: attemptStartTime,
        expiresAt: attemptEndTime,
        questions: questionData,
        isSubmitted: false
      });

      // Increment attemptCount on FIRST start
      exam.attemptCount = (exam.attemptCount || 0) + 1;
      exam.latestAttemptAt = new Date();
      await exam.save();
    }

    // ✅ 7️⃣ Prepare response with shuffled questions
    const finalQuestions = session.questions.map(qSession => {
      const question = exam.questions.find(
        q => q._id.toString() === qSession.questionId.toString()
      );

      const orderedOptions = qSession.optionOrder.map(
        index => question.options[index]
      );

      return {
        _id: question._id,
        questionText: question.questionText,
        options: orderedOptions,
        subject: question.subject,
        difficulty: question.difficulty
      };
    });

    res.status(200).json({
      message: 'Exam session started',
      sessionId: session._id,
      examId: exam._id,
      name: exam.name,
      duration: exam.duration,
      negativeMarking: exam.negativeMarking,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      questions: finalQuestions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get exam attempt data (resume session)
// @route   GET /api/exams/:id/attempt
// @access  Private/Student
const getExamAttempt = async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user._id;
    const currentTime = new Date();

    // ✅ 1️⃣ Find exam with questions
    const exam = await Exam.findById(examId).populate('questions').lean();

    if (!exam) {
      return res.status(404).json({
        message: 'Exam not found'
      });
    }

    // ✅ 2️⃣ Find session
    const session = await ExamSession.findOne({
      student: studentId,
      exam: examId
    });

    if (!session) {
      return res.status(404).json({
        message: 'Exam session not found. Please start the exam first.'
      });
    }

    // ✅ 3️⃣ Validate session not already submitted
    if (session.isSubmitted) {
      return res.status(400).json({
        message: 'You have already submitted this exam'
      });
    }

    // ✅ 4️⃣ Validate session not expired
    if (currentTime > session.expiresAt) {
      return res.status(400).json({
        message: 'Your exam session has expired'
      });
    }

    // ✅ 5️⃣ Calculate remaining time
    const remainingMs = session.expiresAt - currentTime;
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    // ✅ 6️⃣ Prepare questions with shuffled options
    const finalQuestions = session.questions.map(qSession => {
      const question = exam.questions.find(
        q => q._id.toString() === qSession.questionId.toString()
      );

      if (!question) return null;

      const orderedOptions = qSession.optionOrder.map(
        index => question.options[index]
      );

      return {
        _id: question._id,
        questionText: question.questionText,
        options: orderedOptions,
        subject: question.subject,
        difficulty: question.difficulty
      };
    }).filter(Boolean);

    res.status(200).json({
      message: 'Exam attempt data retrieved',
      sessionId: session._id,
      examId: exam._id,
      name: exam.name,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      remainingSeconds,
      questions: finalQuestions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Activate an exam
// @route   PATCH /api/exams/:id/activate
// @access  Private/Admin/Owner
const activateExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // 📋 Validate questions exist
        if (!exam.questions || exam.questions.length === 0) {
            return res.status(400).json({
                message: 'Add at least one question before activating this exam'
            });
        }

        // 🔐 Optional: Only creator admin or owner can activate
        if (
            req.user.role === 'admin' &&
            exam.createdBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized to activate this exam' });
        }

        exam.status = 'active';
        await exam.save();

        return res.status(200).json({
            message: 'Exam activated successfully',
            exam
        });

    } catch (error) {
        console.error('Activate Error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Deactivate exam (set status back to draft)
// @route   PUT /api/exams/:id/deactivate
// @access  Private (Admin / Owner)
const deactivateExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // 🔐 Check if exam can be deactivated
        if (exam.status === 'closed') {
            return res.status(400).json({
                message: 'Closed exams cannot be deactivated'
            });
        }

        if (exam.status !== 'active') {
            return res.status(400).json({
                message: 'Only active exams can be deactivated'
            });
        }

        const attemptCount = exam.attemptCount || 0;
        const userRole = req.user.role?.toLowerCase();

        // 🔐 Deactivation Rules:
        // - If attemptCount === 0: Admin and Owner can deactivate
        // - If attemptCount > 0: Only Owner can deactivate
        
        if (attemptCount > 0 && userRole !== 'owner') {
            return res.status(403).json({
                message: 'Only owner can deactivate exam after students have attempted it'
            });
        }

        // 🔐 Admin can only deactivate their own exams
        if (userRole === 'admin') {
            if (exam.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    message: 'Not authorized to deactivate this exam'
                });
            }
        }

        // ✅ Deactivate exam
        exam.status = 'draft';
        await exam.save();

        return res.status(200).json({
            message: 'Exam deactivated successfully',
            exam
        });

    } catch (error) {
        console.error('Deactivate Error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit exam
// @route   POST /api/exams/:id/submit
// @access  Private (Student)
const submitExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user._id;
    const { answers } = req.body;
    const currentTime = new Date();

    // ✅ 1️⃣ Validate request body
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        message: 'Answers array is required'
      });
    }

    // ✅ 2️⃣ Check exam exists
    const exam = await Exam.findById(examId).populate('questions');

    if (!exam) {
      return res.status(404).json({
        message: 'Exam not found'
      });
    }

    // ✅ 3️⃣ Check session exists
    const session = await ExamSession.findOne({
      student: studentId,
      exam: examId
    });

    if (!session) {
      return res.status(404).json({
        message: 'Exam session not found. Please start the exam first.'
      });
    }

    // ✅ 4️⃣ Validate session not already submitted
    if (session.isSubmitted) {
      return res.status(400).json({
        message: 'You have already submitted this exam'
      });
    }

    // ✅ 5️⃣ Validate session not expired
    if (currentTime > session.expiresAt) {
      return res.status(400).json({
        message: 'Exam time has expired. Submission not allowed.'
      });
    }

    // ✅ 6️⃣ Calculate time taken
    const submitTime = new Date();
    const rawTimeTaken = Math.floor(
      (submitTime - session.startedAt) / 1000
    );

    const maxAllowedTime = exam.duration * 60;
    const timeTaken =
      rawTimeTaken > maxAllowedTime ? maxAllowedTime : rawTimeTaken;

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let score = 0;

    const totalQuestions = exam.questions.length;
    const marksPerQuestion = exam.totalMarks / totalQuestions;

    const negativeMarks = exam.negativeMarking
      ? marksPerQuestion * 0.25
      : 0;

    // ✅ 7️⃣ Evaluate answers with session option order
    const evaluatedAnswers = answers
      .map((submittedAnswer) => {
        const question = exam.questions.find(
          (q) => q._id.toString() === submittedAnswer.questionId
        );

        if (!question) return null;

        // Find session question to get option order
        const sessionQuestion = session.questions.find(
          (q) =>
            q.questionId.toString() === submittedAnswer.questionId
        );

        if (!sessionQuestion) return null;

        // Convert shuffled index back to original index using option order
        const originalIndex =
          sessionQuestion.optionOrder[
            submittedAnswer.selectedOptionIndex
          ];

        const isCorrect =
          question.correctOptionIndex === originalIndex;

        if (isCorrect) {
          correctAnswers++;
          score += marksPerQuestion;
        } else {
          wrongAnswers++;
          score -= negativeMarks;
        }

        return {
          questionId: question._id,
          selectedOptionIndex: submittedAnswer.selectedOptionIndex,
          isCorrect
        };
      })
      .filter(Boolean);

    if (score < 0) score = 0;

    const percentage = (score / exam.totalMarks) * 100;
    const status =
      score >= exam.passingMarks ? 'Passed' : 'Failed';

    // ✅ 8️⃣ Create result document
    const result = await Result.create({
      student: studentId,
      exam: examId,
      score,
      totalQuestions,
      correctAnswers,
      percentage,
      timeTaken,
      status,
      answers: evaluatedAnswers
    });

    // ✅ 9️⃣ Mark session as submitted
    session.isSubmitted = true;
    await session.save();

    // ✅ 1️⃣0️⃣ Return result summary
    res.status(201).json({
      message: 'Exam submitted successfully',
      resultId: result._id,
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage.toFixed(2),
      timeTaken: result.timeTaken,
      status: result.status
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete an exam manually
// @route   PATCH /api/exams/:id/complete
// @access  Private/Admin/Owner
const completeExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Only admin who created or owner can complete
    if (
      req.user.role === "admin" &&
      exam.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to complete this exam"
      });
    }

    if (exam.status === "completed") {
      return res.status(400).json({
        message: "Exam already completed"
      });
    }

    exam.status = "completed";
    await exam.save();

    res.json({
      message: "Exam marked as completed",
      exam
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update an exam (only when draft)
// @route   PUT /api/exams/:id
// @access  Private (Admin / Owner)
const updateExam = async (req, res) => {
  try {
    const examId = req.params.id;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // 🔐 Check attemptCount from exam model
    const attemptCount = exam.attemptCount || 0;
    
    if (attemptCount > 0) {
      return res.status(400).json({
        message: "Exam cannot be edited after students have attempted it"
      });
    }

    // 🔐 Only allow editing when draft
    if (exam.status !== "draft") {
      return res.status(400).json({
        message: "Exam cannot be edited after activation"
      });
    }

    // 🔐 Admin can edit only their own exam
    if (req.user.role === "admin") {
      if (exam.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Not authorized to edit this exam"
        });
      }
    }

    // Owner can edit any draft exam

    // 📝 Update allowed fields
    const {
      name,
      duration,
      subject,
      totalMarks,
      passingMarks,
      questions,
      negativeMarking,
      startTime,
      endTime
    } = req.body;

    const nextStartTime = startTime !== undefined ? new Date(startTime) : exam.startTime;
    const nextEndTime = endTime !== undefined ? new Date(endTime) : exam.endTime;

    if (startTime !== undefined && Number.isNaN(nextStartTime.getTime())) {
      return res.status(400).json({ message: "Invalid startTime format" });
    }

    if (endTime !== undefined && Number.isNaN(nextEndTime.getTime())) {
      return res.status(400).json({ message: "Invalid endTime format" });
    }

    if (nextEndTime <= nextStartTime) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }

    if (name !== undefined) exam.name = name;
    if (duration !== undefined) exam.duration = duration;
    if (subject !== undefined) exam.subject = subject;
    if (totalMarks !== undefined) exam.totalMarks = totalMarks;
    if (passingMarks !== undefined) exam.passingMarks = passingMarks;
    if (questions !== undefined) exam.questions = questions;
    if (negativeMarking !== undefined)
      exam.negativeMarking = negativeMarking;
    if (startTime !== undefined) exam.startTime = nextStartTime;
    if (endTime !== undefined) exam.endTime = nextEndTime;

    await exam.save();

    res.json({
      message: "Exam updated successfully",
      exam
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an exam (only if draft)
// @route   DELETE /api/exams/:id
// @access  Private (Admin / Owner)
const deleteExam = async (req, res) => {
  try {
    const examId = req.params.id;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // 🔐 Check attemptCount from exam model - SECURITY CRITICAL
    const attemptCount = exam.attemptCount || 0;
    
    if (attemptCount > 0) {
      return res.status(400).json({
        message: "Exam cannot be deleted after students have attempted it"
      });
    }

    // 🔐 Allow delete only if draft
    if (exam.status !== "draft") {
      return res.status(400).json({
        message: "Exam cannot be deleted after activation"
      });
    }

    // 🔐 Admin can delete only their own exam
    if (req.user.role === "admin") {
      if (exam.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Not authorized to delete this exam"
        });
      }
    }

    // Owner can delete any draft exam

    await exam.deleteOne();

    return res.status(200).json({
      message: "Exam deleted successfully"
    });

  } catch (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add questions to an exam
// @route   PUT /api/exams/:id/add-questions
// @access  Private/Admin
const addQuestionsToExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const { questionIds } = req.body;

    // Validation
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one question ID"
      });
    }

    // Find exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // 🔐 Check attemptCount from exam model - cannot modify after attempts
    const attemptCount = exam.attemptCount || 0;
    
    if (attemptCount > 0) {
      return res.status(400).json({
        message: "Questions cannot be added after students have attempted this exam"
      });
    }

    // Only allow editing when draft
    if (exam.status !== "draft") {
      return res.status(400).json({
        message: "Questions can only be added to draft exams"
      });
    }

    // Authorization check for admin
    if (req.user.role === "admin") {
      if (exam.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Not authorized to modify this exam"
        });
      }
    }

    // Add questions, avoiding duplicates
    const existingQuestionIds = exam.questions.map(q => q.toString());
    let addedCount = 0;

    for (const questionId of questionIds) {
      if (!existingQuestionIds.includes(questionId.toString())) {
        exam.questions.push(questionId);
        addedCount++;
      }
    }

    if (addedCount === 0) {
      return res.status(400).json({
        message: "All selected questions are already added to this exam"
      });
    }

    await exam.save();

    res.json({
      message: `${addedCount} question(s) added successfully to the exam`,
      exam: await exam.populate("questions")
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get live exams for admin dashboard
// @route   GET /api/exams/live
// @access  Private (Admin/Owner)
const getLiveExams = async (req, res) => {
  try {
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 5 : parsedLimit;

    const filter = { status: 'active' };

    const [exams, totalCount] = await Promise.all([
      Exam.find(filter)
        .select('name subject duration totalMarks attemptCount latestAttemptAt startTime endTime createdBy createdAt status')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Exam.countDocuments(filter)
    ]);

    res.status(200).json({
      exams,
      totalCount,
      shownCount: exams.length,
      hasMore: totalCount > exams.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top 5 recent exams for admin dashboard
// @route   GET /api/exams/dashboard-summary
// @access  Private (Admin/Owner)
const getDashboardSummaryExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      status: { $in: ['draft', 'active', 'completed'] }
    })
      .select('name subject duration totalMarks questions attemptCount latestAttemptAt startTime endTime createdAt status')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = { createExam, getAllExams, startExam, getExamAttempt, getExamById, submitExam, completeExam, updateExam, deleteExam, addQuestionsToExam, getLiveExams, getDashboardSummaryExams };
