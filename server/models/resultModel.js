const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    // Links result to the Student who attempted the exam
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Links result to the specific Exam
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },

    // Final score obtained by the student
    score: {
      type: Number,
      required: true,
      min: 0
    },

    // Total number of questions in the exam
    totalQuestions: {
      type: Number,
      required: true
    },

    // Number of correct answers given by the student
    correctAnswers: {
      type: Number,
      required: true
    },

    // Calculated percentage (stored to avoid recalculating every time)
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // Time taken by student to complete exam (in seconds)
    timeTaken: {
      type: Number,
      required: true,
      min: 0
    },

    // Pass/Fail status based on exam passing criteria
    status: {
      type: String,
      enum: ['Passed', 'Failed'],
      required: true
    },

    // Level 2 Feature: Detailed Analysis
    // We save exactly what the student answered so they can review later
    answers: [
      {
        // Links to the specific Question in the exam
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true
        },

        // The index of the option selected by the student
        selectedOptionIndex: {
          type: Number,
          required: true
        },

        // Whether the selected answer was correct
        isCorrect: {
          type: Boolean,
          required: true
        }
      }
    ]
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// Prevent same student from submitting the same exam twice
// This ensures database-level protection against duplicate attempts
resultSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
