const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Location = require("../models/location");

// ✅ Admin Middleware
const checkAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.status(403).send("<script>alert('Access Denied! Admins Only'); window.location='/';</script>");
  }
  next();
};

// ✅ Multer Configuration for Image Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ✅ GET: Home - List All Locations
router.get("/", async (req, res) => {
  const locations = await Location.find();
  res.render("index", { locations, isAdmin: req.session.isAdmin });
});

// ✅ GET: Add Location Form
router.get("/add", checkAdmin, (req, res) => {
  res.render("add");
});

// ✅ POST: Add Location (with Image Upload)
router.post("/add", checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, address } = req.body;
    const image = req.file ? req.file.filename : "default.png";

    const newLocation = new Location({ name, address, image });
    await newLocation.save();

    res.send("<script>alert('Location Added Successfully!'); window.location='/';</script>");
  } catch (error) {
    console.error("Add Error:", error);
    res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/add';</script>");
  }
});

// ✅ GET: Edit Location Form
router.get("/edit/:id", checkAdmin, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).send("<script>alert('Location Not Found!'); window.location='/';</script>");
    }
    res.render("edit", { location, isAdmin: req.session.isAdmin }); // Optional if layout depends on isAdmin
  } catch (error) {
    console.error("Edit Page Error:", error);
    res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/';</script>");
  }
});

// ✅ POST: Update Location (Image Optional)
router.post("/edit/:id", checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, address } = req.body;
    const updatedFields = { name, address };

    if (req.file) {
      updatedFields.image = req.file.filename;
    }

    await Location.findByIdAndUpdate(req.params.id, updatedFields);
    res.send("<script>alert('Location Updated Successfully!'); window.location='/';</script>");
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/';</script>");
  }
});

// ✅ POST: Delete Location
router.post("/delete/:id", checkAdmin, async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.send("<script>alert('Location Deleted Successfully!'); window.location='/';</script>");
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/';</script>");
  }
});

module.exports = router;
