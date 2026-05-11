const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Enter your name'],
        trim: true
    },
    userIdNumber: {
    type: String,
    unique: true,
    sparse: true   // VERY IMPORTANT so owner can have null
    },
    email: {
        type: String,
        required: [true, 'Enter your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] 
    },
    password: {
        type: String,
        required: [true, 'Enter your password'],
        minlength: 6,
        select: false // Do not return password in queries
    },
    role: {
        type: String,
        enum: ['student', 'admin' , 'owner'],
        default: 'student' // By default, everyone is a student
    },
    
    // We add this now so we don't have to change the DB later for Level 3
    pic: {
        type: String,
        required: true,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    }
}, {
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});


// Index for faster role-based queries (e.g., listing all admins)
userSchema.index({ role: 1 });



// 🔐 Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
    
});


// 🔐 Add method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


