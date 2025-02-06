require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Serve Static Files (Bootstrap needs assets like icons)
app.use(express.static(path.join(__dirname, "public")));

// Home Route - Render EJS
app.get("/", (req, res) => {
    res.render("index");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
