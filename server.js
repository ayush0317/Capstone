const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const Location = require("./models/location"); // ✅ Import Locations Model

const app = express();

// ✅ Enable CORS
app.use(cors());

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

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

// ✅ Load Default Locations If Database is Empty
async function loadDefaultLocations() {
    const existingLocations = await Location.find();
    if (existingLocations.length === 0) {
        await Location.insertMany([
            {
                name: "Mumbai Grand Dining",
                address: "Nariman Point, Mumbai, India",
                image: "/Images/777.png"
            },
            {
                name: "Delhi Rooftop Lounge",
                address: "Aerocity, New Delhi, India",
                image: "/Images/888.png"
            },
            {
                name: "Punjab Authentic Kitchen",
                address: "Amritsar, Punjab, India",
                image: "/Images/999.png"
            }
        ]);
        console.log("✅ Default Locations Loaded");
    }
}

// ✅ Ensure Default Locations Exist Before Server Starts
loadDefaultLocations();

// ✅ Render Home Page & Pass `isAdmin`
app.get("/", async (req, res) => {
    try {
        const locations = await Location.find();
        res.render("index", {
            locations: locations, 
            isAdmin: req.session.isAdmin || false // ✅ Ensure `isAdmin` is always defined
        });
    } catch (error) {
        res.status(500).send("Error loading page");
    }
});

// ✅ Import Routes (Ensure Correct Path)
const authRoutes = require("./routes/auth");
const locationRoutes = require("./routes/location"); // ⬅️ Correcting this to "locations.js"
app.use("/", authRoutes);
app.use("/", locationRoutes);

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
