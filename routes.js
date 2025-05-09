const express = require("express");
const router = express.Router();
const Book = require('../Models/book');
const addProfile = require('../Models/profile');
const multer = require('multer');

// Configure multer for file uploads
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});
// middleware/auth.js
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

module.exports = isAuthenticated;


// Middleware for file uploads
var upload = multer({ storage: storage }).single("image");

// Insert book in the database
router.post('/Add', upload, async (req, res) => {
    const book = new Book({
        bookname: req.body.bookname,
        authorname: req.body.authorname,
        price: req.body.price,
        summary: req.body.summary,
        image: req.file.filename,
        mark: false
    });
    try {
        await book.save();
        res.redirect("/Add");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error saving the book.");
    }
});

// Get all books data
router.get("/", async (req, res) => {
    let data = await Book.find();
    res.render('index', {
        title: 'Home page',
        books: data,
    });
});

// Show books borrowed by user
router.get("/Profile", async (req, res) => {
    let data = await addProfile.find();
    res.render('user_profile', {
        title: 'Profile',
        addBook: data
    });
});

// Borrow a book
router.get("/Profile/:id", async (req, res) => {
    let result = await Book.findOne({ _id: req.params.id });
    const borrow = new addProfile({
        bookname: result.bookname,
        authorname: result.authorname,
        price: result.price,
        summary: result.summary,
        image: result.image,
        bookId: req.params.id
    });
    await Book.updateOne({ _id: req.params.id }, { mark: true });
    await borrow.save();
    res.redirect("/");
});

// Return a book
router.get("/Home/:id", async (req, res) => {
    const data = await addProfile.findOne({ _id: req.params.id });
    await addProfile.deleteOne({ _id: req.params.id });
    await Book.updateOne({ _id: data.bookId }, { mark: false });
    res.redirect("/Profile");
});

// Add book details page
router.get("/Add", (req, res) => {
    res.render("add_book", { title: "Add Book" });
});

// Login route - ensure you have this route
router.get("/login", (req, res) => {
    res.render("login", { title: "Login" }); 
});

// Handle login post request
router.post("/login", async (req, res) => {
    const { role, name, password } = req.body;
    
    req.session.user = { name, role }; // Store user info in session
    res.redirect("/"); 
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Failed to log out");
        }
        res.redirect("/login"); // Redirect to login after successful logout
    });
});
router.get("/Register", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Failed to Register");
        }
        res.redirect("/login"); // Redirect to login after successful logout
    });
});

module.exports = router;
