const express = require("express");
const router = express.Router();
const User = require("../models/user");

// ✅ Admin Credentials
const ADMIN_EMAIL = "vidhivcc@gmail.com";
const ADMIN_PASSWORD = "Ayush@1711";

// ✅ Render Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// ✅ Render Signup Page
router.get("/signup", (req, res) => {
    res.render("signup");
});

// ✅ Handle Signup
router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, address, email, password } = req.body;

        // ✅ Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("<script>alert('Email already exists!'); window.location='/signup';</script>");
        }

        // ✅ Validate password (Minimum 8 characters, 1 uppercase, 1 special character)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).send("<script>alert('Password must be at least 8 characters long, contain one uppercase letter, and one special character.'); window.location='/signup';</script>");
        }

        // ✅ Save new user to the database
        const newUser = new User({ firstName, lastName, address, email, password });
        await newUser.save();

        // ✅ Redirect to login page after successful signup
        res.send("<script>alert('Registered Successfully! Please log in.'); window.location='/login';</script>");
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/signup';</script>");
    }
});

// ✅ Handle Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Admin Login Check
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            req.session.user = { email, isAdmin: true };
            req.session.isAdmin = true;
            return res.redirect("/");
        }

        // ✅ Normal User Login Check
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).send("<script>alert('Invalid email or password!'); window.location='/login';</script>");
        }

        // ✅ Regular User Login
        req.session.user = user;
        req.session.isAdmin = false;
        res.redirect("/");
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/login';</script>");
    }
});

// ✅ Handle Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;
