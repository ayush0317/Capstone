const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

const app = express();

// ✅ Enable CORS
app.use(cors());

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ Define User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: true
}));

// ✅ Set EJS as the View Engine
app.set("view engine", "ejs");

// ✅ Render Home Page (Index)
app.get("/", (req, res) => {
    const message = req.session.message || "";  // Ensure message is always defined
    req.session.message = "";  // Clear message after displaying
    res.render("index", { message });
});


// ✅ Render Sign Up Page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// ✅ Render Login Page
app.get("/login", (req, res) => {
    res.render("login");
});

// ✅ Handle Sign Up
app.post("/signup", async (req, res) => {
    try {
        const { firstName, email, password } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("<script>alert('Email already exists!'); window.location='/signup';</script>");
        }

        // Save the new user
        const newUser = new User({ firstName, email, password });
        await newUser.save();

        // Redirect to login page after registration
        res.send("<script>alert('Registered Successfully! Please log in.'); window.location='/login';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/signup';</script>");
    }
});

// ✅ Handle Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in database
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).send("<script>alert('Invalid email or password!'); window.location='/login';</script>");
        }

        // Store user session and redirect
        req.session.user = user;
        req.session.message = "Logged in Successfully!";
        res.redirect("/");
    } catch (error) {
        res.status(500).send("<script>alert('Server Error, Try Again!'); window.location='/login';</script>");
    }
});

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
