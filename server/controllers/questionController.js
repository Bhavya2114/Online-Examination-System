const Question = require('../models/questionModel');

const addQuestion = async (req, res) => {
    try {
        const { questionText, options, correctOptionIndex, subject, difficulty } = req.body;

        // 1️⃣ Basic validation
        if (!questionText || !options || correctOptionIndex === undefined || !subject || !difficulty) {
            return res.status(400).json({
                message: 'Please provide all required fields'
            });
        }

        // 2️⃣ Check if options is array
        if (!Array.isArray(options)) {
            return res.status(400).json({
                message: 'Options must be an array'
            });
        }

        // 3️⃣ Check minimum 2 options
        if (options.length < 2) {
            return res.status(400).json({
                message: 'At least two options are required'
            });
        }

        // 4️⃣ Check correctOptionIndex range
        if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
            return res.status(400).json({
                message: 'Correct option index is invalid'
            });
        }

        const question = await Question.create({
            questionText,
            options,
            correctOptionIndex,
            subject,
            difficulty
        });

        res.status(201).json(question);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private/Admin
const getAllQuestions = async (req, res) => {
    try {
        const { subject, difficulty } = req.query;

        let filter = {};

        // Optional filtering
        if (subject) {
            filter.subject = subject.toLowerCase();
        }

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        const questions = await Question.find(filter).lean();

        res.json(questions);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
    try {
        const { questionText, options, correctOptionIndex, subject, difficulty } = req.body;

        // Validation
        if (!questionText || !options || correctOptionIndex === undefined || !subject || !difficulty) {
            return res.status(400).json({
                message: 'Please provide all required fields'
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                message: 'At least two options are required'
            });
        }

        if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
            return res.status(400).json({
                message: 'Correct option index is invalid'
            });
        }

        const question = await Question.findByIdAndUpdate(
            req.params.id,
            {
                questionText,
                options,
                correctOptionIndex,
                subject,
                difficulty
            },
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { addQuestion, getAllQuestions, deleteQuestion, updateQuestion };
