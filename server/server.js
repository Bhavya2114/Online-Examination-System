//“Bring all required tools before starting the server.”
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');


// Load environment variables
dotenv.config();

// Connect to Database (“Before starting server, connect to MongoDB.”)
connectDB();

const app = express();

// Middleware (Allows us to accept JSON data)
app.use(express.json());
// Frontend → Backend communication.
app.use(cors());


// Routes
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Basic Route to Test Server
app.get('/', (req, res) => {
    res.send('API is running...');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));


