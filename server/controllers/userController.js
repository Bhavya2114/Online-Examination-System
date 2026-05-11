const bcrypt = require('bcryptjs');

const user = await User.findOne({ email }).select('+password');

if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid email or password" });
}

// Login success
res.json({ message: "Login successful" });




// not completed and not tested yet. I will complete this code tommorow and test it.