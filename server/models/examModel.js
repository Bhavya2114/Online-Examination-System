const mongoose = require('mongoose');

const examSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Enter an exam name'],
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        default: 30, // In minutes (Level 2 Feature: Timer)
        min: 1
    },
    subject: {
        type: String, // e.g., "Programming", "Math"
        required: true,
        lowercase: true
    },
    totalMarks: {
        type: Number,
        min: 1,
        required: true
    },
    passingMarks: {
    type: Number,
    required: true,
    min: 0,
    validate: {
        validator: function(value) {
            return value <= this.totalMarks;
        },
        message: "Passing marks cannot be greater than total marks"
      }
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question', // This links to the 'questionModel.js'
            required: true
        }
    ],
    // Enable or disable negative marking
    negativeMarking: {
        type: Boolean,
        default: false
    },

    // Negative marks deducted per wrong answer (if negativeMarking is true)
    negativeMarksPerQuestion: {
        type: Number,
        default: 0,
        min: 0
    },

    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this exam to the Admin who created it
        required: true
    },
    status: {
    type: String,
    enum: {
        values: ['draft', 'active', 'completed'],
        message: 'Invalid exam status'
    },
    default: 'draft'
    },
    // Track number of student attempts
    attemptCount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Scheduling fields
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    latestAttemptAt: {
        type: Date,
        default: null
    },
    hiddenFromDashboard: {
  type: Boolean,
  default: false
}
}, {
    timestamps: true
});

// Index for faster admin-based exam search
examSchema.index({ createdBy: 1 });

// Index for faster subject filtering
examSchema.index({ subject: 1 });

// Index for filtering exams by status (e.g., active exams)
examSchema.index({ status: 1 });

// Compound index for dashboard live exams query: filter by status and sort by latest created exams
examSchema.index({ status: 1, createdAt: -1 });

// Index for time-based queries (active/upcoming/completed exams)
examSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Exam', examSchema);


// Had to resolve this tommorw
/*
One Minor "Gotcha" to Watch Out For
In your passingMarks validator:

JavaScript
validator: function(value) {
    return value <= this.totalMarks;
}
It works perfectly when CREATING a new exam.

It might fail during UPDATES. If you try to update only the passingMarks field later without sending the totalMarks field again, Mongoose sometimes doesn't know what this.totalMarks is.

Fix for later: Just ensure that when you update an exam in your Controller (Day 3/4), you check this logic in your code too, not just the database schema.

*/