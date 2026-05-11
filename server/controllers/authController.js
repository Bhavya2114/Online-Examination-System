const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// =============================
// REGISTER USER
// =============================
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1️⃣ Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let userIdNumber = null;

        // 2️⃣ Generate ID for student & admin only
        if (role === "student" || role === "admin") {

            // Count only student + admin (owner excluded)
            const count = await User.countDocuments({
                role: { $in: ["student", "admin"] }
            });

            const nextNumber = count + 1;

            const padded = String(nextNumber).padStart(5, "0");

            userIdNumber = `123${padded}`;   // 8 digit ID
        }

        // 3️⃣ Create user (password hashing handled in model)
        const user = await User.create({
            name,
            email,
            password,
            role,
            userIdNumber   // will be null for owner
        });

        // 4️⃣ Send response
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userIdNumber: user.userIdNumber,
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// =============================
// LOGIN USER
// =============================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userIdNumber: user.userIdNumber,
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Login server error' });
    }
};


// =============================
// GET STUDENTS
// =============================
const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// =============================
// GET ADMINS
// =============================
const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getStudents,
    getAdmins
};
