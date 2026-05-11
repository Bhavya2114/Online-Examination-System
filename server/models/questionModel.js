const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    questionText: {
    type: String,
    required: [true, 'Please add the question text'],
    minlength: 5,
    trim: true
    },

    options: {
    type: [String],
    required: true,
    validate: {
        validator: function(value) {
            return value.length >= 2;
        },
        message: "A question must have at least two options"
    }
    },

    correctOptionIndex: {
    type: Number,
    required: true,
    validate: {
        validator: function(value) {
            return value >= 0 && value < this.options.length;
        },
        message: "Correct option index is out of range"
    }
    },

    subject: {
        type: String, // e.g., "Java", "React" - helpful for filtering later
        trim: true,
        lowercase: true,
        required: true
    },
    difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
    }
}, {
    timestamps: true
});

// Index for faster subject filtering
questionSchema.index({ subject: 1 });

module.exports = mongoose.model('Question', questionSchema);