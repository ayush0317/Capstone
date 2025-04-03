const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const Location = require("./models/location");

const app = express();

// ✅ Enable CORS
app.use(cors());



mongoose.connect("mongodb://mongo:CKqoDUtOZWhRHyhiMeymoCqxDYVKHDQD@switchyard.proxy.rlwy.net:30876", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to Railway MongoDB"))
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

// ✅ Pass User Session Data to All Views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAdmin = req.session.user?.isAdmin || false;
    next();
});

// ✅ Set EJS as the View Engine
app.set("view engine", "ejs");

const feedbackRoutes = require('./routes/thankyou');
app.use("/thankyou", feedbackRoutes);

// ✅ Ensure Default Locations Exist Before Server Starts


// ✅ Render Home Page
app.get("/", async (req, res) => {
    try {
        const locations = await Location.find();
        res.render("index", {
            locations,
            user: req.session.user
        });
    } catch (error) {
        console.error("❌ Error loading home page:", error);
        res.status(500).send("Error loading page");
    }
});

// ✅ Import Routes
const menuRoutes = require("./routes/menu");
const authRoutes = require("./routes/auth");
const locationRoutes = require("./routes/location");
const reportsRoute = require("./routes/reports");
app.use("/", reportsRoute);

const orderRoutes = require("./routes/order");
app.use("/order", orderRoutes);
const profileRoutes = require("./routes/profile");
app.use("/", profileRoutes);


app.use("/menu", menuRoutes);
const cartRoutes = require("./routes/cart");
app.use("/cart", cartRoutes);
const reportsRoutes = require("./routes/reports");
app.use("/reports", reportsRoutes);



app.get("/checkout", (req, res) => {
    res.render("checkout", {
        user: req.session.user
    });
});
const tableRoutes = require("./routes/table");
app.use("/tables", tableRoutes);
app.use("/order", orderRoutes); 

const reservationRoutes = require("./routes/reservation");
app.use("/reserve", reservationRoutes);
app.use("/", tableRoutes);
app.use("/", authRoutes);
app.use("/", locationRoutes);
const reservationRoutess = require("./routes/reservation");
app.use("/", reservationRoutess);

const pastOrderRoutes = require("./routes/pastorders"); // or whatever filename you use
app.use("/", pastOrderRoutes);

// ✅ Start Server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
