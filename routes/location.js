const express = require("express");
const router = express.Router();
const multer = require("multer"); // ✅ Import multer for file uploads
const Location = require("../models/location");
const path = require("path");

// ✅ Middleware to Check Admin
const checkAdmin = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.status(403).send("<script>alert('Access Denied! Admins Only'); window.location='/';</script>");
    }
    next();
};

// ✅ Set Up Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/Images"); // Save images in 'public/Images'
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// ✅ Fetch Locations
router.get("/", async (req, res) => {
    const locations = await Location.find();
    res.render("index", { locations, isAdmin: req.session.isAdmin });
});

// ✅ Render Add Location Page
router.get("/add", checkAdmin, (req, res) => {
    res.render("add");
});

// ✅ Handle Adding a New Location with Image Upload
router.post("/add", checkAdmin, upload.single("image"), async (req, res) => {
    try {
        const { name, address } = req.body;
        const image = req.file ? req.file.filename : "default.png"; // Store filename

        const newLocation = new Location({ name, address, image });
        await newLocation.save();

        res.send("<script>alert('Location Added Successfully!'); window.location='/';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/add';</script>");
    }
});

// ✅ Render Edit Location Page
router.get("/edit/:id", checkAdmin, async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).send("<script>alert('Location Not Found!'); window.location='/';</script>");
        }
        res.render("edit", { location });
    } catch (error) {
        res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/';</script>");
    }
});

// ✅ Handle Updating Location with Image Upload
router.post("/edit/:id", checkAdmin, upload.single("image"), async (req, res) => {
    try {
        const { name, address } = req.body;
        const image = req.file ? req.file.filename : req.body.oldImage; // Keep old image if none uploaded

        await Location.findByIdAndUpdate(req.params.id, { name, address, image });
        res.send("<script>alert('Location Updated Successfully!'); window.location='/';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/edit';</script>");
    }
});

// ✅ Handle Deleting Location
router.post("/delete/:id", checkAdmin, async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.send("<script>alert('Location Deleted Successfully!'); window.location='/';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/';</script>");
    }
});

module.exports = router;
