const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// ✅ Admin Credentials (Email + Password Check)
const ADMIN_CREDENTIALS = {
    "vidhivcc@gmail.com": "Ayush@1711" // You can add more admin emails & passwords here
};

// ✅ Render Signup Page
router.get("/signup", (req, res) => {
    res.render("signup");
});

// ✅ Handle Signup
router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, address, email, password } = req.body;

        // ✅ Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("<script>alert('Email already exists!'); window.location='/signup';</script>");
        }

        // ✅ Validate password strength
        const passwordRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).send("<script>alert('Password must have 8+ characters, 1 uppercase, 1 special character.'); window.location='/signup';</script>");
        }

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Determine if the user is an Admin based on Email + Password Match
        const isAdmin = ADMIN_CREDENTIALS[email] && bcrypt.compareSync(ADMIN_CREDENTIALS[email], hashedPassword);

        // ✅ Save user
        const newUser = new User({ 
            firstName, 
            lastName, 
            address, 
            email, 
            password: hashedPassword, 
            isAdmin // ✅ Store admin status based on credentials
        });

        await newUser.save();
        res.send("<script>alert('Registered Successfully! Please log in.'); window.location='/login';</script>");

    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/signup';</script>");
    }
});

// ✅ Render Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// ✅ Handle Login (Verify Email & Password for Admins)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("<script>alert('Invalid email or password!'); window.location='/login';</script>");
        }

        // ✅ Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).send("<script>alert('Invalid email or password!'); window.location='/login';</script>");
        }

        // ✅ Verify if User is an Admin (Check against ADMIN_CREDENTIALS)
        let isAdmin = false;
        if (ADMIN_CREDENTIALS[email] && password === ADMIN_CREDENTIALS[email]) {
            isAdmin = true; // ✅ Admins are identified by both email & password match
        }

        // ✅ Store user session
        req.session.user = {
            id: user._id,
            firstName: user.firstName,
            email: user.email,
            isAdmin: isAdmin
        };

        req.session.isAdmin = isAdmin; // ✅ Store admin status separately

        req.session.save(() => {
            res.redirect("/");
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
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
