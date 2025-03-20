const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// ✅ Admin Credentials (Admin Email + Password Check)
const ADMIN_CREDENTIALS = {
    "vidhivcc@gmail.com": "Ayush@1711" // ✅ Add more Admins if needed
};

// ✅ Render Signup Page
router.get("/signup", (req, res) => {
    res.render("signup");
});

// ✅ Handle Signup
router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, address, email, password } = req.body;

        // ✅ Check if Email Already Exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("<script>alert('Email already exists!'); window.location='/signup';</script>");
        }

        // ✅ Validate Password Strength
        const passwordRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).send("<script>alert('Password must have 8+ characters, 1 uppercase, 1 special character.'); window.location='/signup';</script>");
        }

        // ✅ Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Determine if the User is an Admin Based on Credentials
        const isAdmin = ADMIN_CREDENTIALS[email] && password === ADMIN_CREDENTIALS[email];

        // ✅ Save User
        const newUser = new User({
            firstName,
            lastName,
            address,
            email,
            password: hashedPassword,
            isAdmin // ✅ Store Admin Status Based on Credentials
        });

        await newUser.save();
        res.send("<script>alert('Registered Successfully! Please log in.'); window.location='/login';</script>");

    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/signup';</script>");
    }
});
router.post("/login/user", async (req, res) => {
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

        // ✅ Store user session
        req.session.user = {
            id: user._id,
            firstName: user.firstName,
            email: user.email,
            isAdmin: user.isAdmin || false  // ✅ Check if user is Admin
        };

        req.session.isAdmin = user.isAdmin || false;

        // ✅ Redirect to the home page
        res.redirect("/");

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/login';</script>");
    }
});

// ✅ Render Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// ✅ Handle User Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Check if User Exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("<script>alert('Invalid email or password!'); window.location='/login';</script>");
        }

        // ✅ Compare Passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).send("<script>alert('Invalid email or password!'); window.location='/login';</script>");
        }

        // ✅ Verify if User is Admin (Using Stored Credentials)
        let isAdmin = ADMIN_CREDENTIALS[email] && password === ADMIN_CREDENTIALS[email];

        // ✅ Store User Session
        req.session.user = {
            id: user._id,
            firstName: user.firstName,
            email: user.email,
            isAdmin: isAdmin
        };

        req.session.isAdmin = isAdmin; // ✅ Store Admin Status Separately

        req.session.save(() => {
            res.redirect("/");
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/login';</script>");
    }
});

// ✅ Handle Owner Login (✅ Admins Are Verified Here)
router.post("/login/owner", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Check if the Email Matches Any Admin Credential
        let isAdmin = ADMIN_CREDENTIALS[email] && password === ADMIN_CREDENTIALS[email];

        // ✅ Allow Only Admins to Log In as Owner
        if (!isAdmin) {
            return res.status(403).send("<script>alert('Access Denied: Only Admins Can Log In as Owners'); window.location='/login';</script>");
        }

        // ✅ Store Admin Session
        req.session.user = {
            email,
            isAdmin: true
        };

        req.session.isAdmin = true;

        req.session.save(() => {
            res.redirect("/"); // ✅ Redirect to Admin Dashboard
        });

    } catch (error) {
        console.error("❌ Owner Login Error:", error);
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
