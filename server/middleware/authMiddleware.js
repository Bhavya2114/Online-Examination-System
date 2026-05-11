const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// 🛡️ The Bouncer: Checks if the user is logged in
const protect = async (req, res, next) => {
    let token;

    // Check if the request has an authorization header that starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format is "Bearer <token>", so we split by space and take the 2nd part)
            token = req.headers.authorization.split(' ')[1];

            // Verify token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from the database using the ID inside the token
            // We attach this user to the 'req' object so the next function can use it
            req.user = await User.findById(decoded.id);

            next(); // Wristband is good, let them in!
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token was found at all
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Students only' });
  }
  next();
};

// 👑 The VIP Bouncer: Checks if the logged-in user is an Admin
const admin = (req, res, next) => {
    // Look closely at this line! It needs BOTH admin and owner
    if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
        next(); // there is admin or owner, let them in!
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }

};

// 🏛️ Owner Bouncer: ONLY lets the Owner pass
const owner = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized. Owner access only.' });
    }
};



const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }
    next();
  };
};

module.exports = { protect, admin, owner, studentOnly, authorizeRoles };