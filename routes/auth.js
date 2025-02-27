const express = require("express");
const router = express.Router();
const User = require("../models/user");

const ADMIN_EMAIL = "vidhivcc@gmail.com";
const ADMIN_PASSWORD = "Ayush@1711";

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
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/login';</script>");
    }
});

// ✅ Render Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// ✅ Render Signup Page
router.get("/signup", (req, res) => {
    res.render("signup");
});

module.exports = router;
