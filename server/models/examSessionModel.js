const mongoose = require('mongoose');

const examSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    expiresAt: {
      type: Date,
      required: true
    },

    isSubmitted: {
      type: Boolean,
      default: false
    },

    // Store question and option order for fairness
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question'
        },
        optionOrder: [
          {
            type: Number
          }
        ]
      }
    ]

    // I will add this later when I implement auto-grading. For now, we can store answers in the frontend and send them to backend during submission.
    // Store answers for auto-grading
    // answers: [
    //   {
    //     questionId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'Question'
    //     },
    //     selectedOptionIndex: {
    //       type: Number
    //     }
    //   }
    // ]

  },
  { timestamps: true }
);

// Prevent duplicate session
examSessionSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('ExamSession', examSessionSchema);
