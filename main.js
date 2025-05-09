require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const isAuthenticated = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const uri = process.env.DATABASE_URI; 

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: 'Library_Management_System',
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 30 * 60 * 1000 } 
}));

// Define static folder and view engine
app.use(express.static("uploads"));
app.set('view engine', 'ejs');

// Add custom middleware to set session message
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Database connection
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Database connected"))
    .catch((error) => console.error("Database connection error:", error));
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
    });
    
    mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });
    
// Routes
app.use("", require('./routes/routes'));
app.use("", require('./routes/userRoutes'));

// Server listener
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
