const express = require('express');
const router = express.Router();
const { protect, admin, owner } = require('../middleware/authMiddleware');
const { registerUser, loginUser, getStudents, getAdmins } = require('../controllers/authController');


router.post('/register', registerUser);
router.post('/login', loginUser);

// 🛡️ Protected Route: Only logged-in users can see their profile
router.get('/profile', protect, async (req, res) => {
    // Return the authenticated user's profile data
    const User = require('../models/userModel');
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
});

// 🛡️👑 Admins & Owners can see students
router.get('/students', protect, admin, getStudents);

// 🛡️🏛️ ONLY Owners can see admins
router.get('/admins', protect, owner, getAdmins);

module.exports = router;