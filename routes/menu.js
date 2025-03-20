const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const MenuItem = require("../models/menuItem");

// ✅ Middleware to Check Admin
const checkAdmin = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.status(403).send("<script>alert('Access Denied! Admins Only'); window.location='/menu';</script>");
    }
    next();
};

// ✅ Multer Storage for Image Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/Images"); // Save images in 'public/Images'
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage: storage });

// ✅ Fetch Menu Items and Render Menu Page
router.get("/", async (req, res) => {
    try {
        const vegAppetizers = await MenuItem.find({ category: "Appetizers", type: "Vegetarian" }) || [];
        const nonVegAppetizers = await MenuItem.find({ category: "Appetizers", type: "Non-Vegetarian" }) || [];
        const vegMainCourse = await MenuItem.find({ category: "Main Course", type: "Vegetarian" }) || [];
        const nonVegMainCourse = await MenuItem.find({ category: "Main Course", type: "Non-Vegetarian" }) || [];
        const desserts = await MenuItem.find({ category: "Desserts" }) || [];
        const beverages = await MenuItem.find({ category: "Beverages" }) || [];
        const specialDishes = await MenuItem.find({ category: "Special Dishes" }) || [];

        res.render("menu", { 
            vegAppetizers, 
            nonVegAppetizers, 
            vegMainCourse, 
            nonVegMainCourse, 
            desserts, 
            beverages, 
            specialDishes,
            isAdmin: req.session.isAdmin || false // ✅ Pass admin status
        });

    } catch (error) {
        console.error("❌ Error fetching menu items:", error);
        res.status(500).send("Server Error");
    }
});

// ✅ Render Add Menu Item Page
router.get("/add", checkAdmin, (req, res) => {
    res.render("addMenuItem");
});

// ✅ Handle Adding a New Menu Item
router.post("/add", checkAdmin, upload.single("image"), async (req, res) => {
    try {
        const { name, description, price, category, type } = req.body;
        const image = req.file ? req.file.filename : "default.png";

        const newMenuItem = new MenuItem({ name, description, price, category, type, image });
        await newMenuItem.save();

        res.send("<script>alert('Menu Item Added Successfully!'); window.location='/menu';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/menu/add';</script>");
    }
});

// ✅ Render Edit Menu Item Page
router.get("/edit/:id", checkAdmin, async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        res.render("editMenuItem", { menuItem });
    } catch (error) {
        res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/menu';</script>");
    }
});

// ✅ Handle Updating Menu Item
router.post("/edit/:id", checkAdmin, upload.single("image"), async (req, res) => {
    try {
        const { name, description, price, category, type } = req.body;
        const image = req.file ? req.file.filename : req.body.oldImage;

        await MenuItem.findByIdAndUpdate(req.params.id, { name, description, price, category, type, image });
        res.send("<script>alert('Menu Item Updated Successfully!'); window.location='/menu';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/menu/edit';</script>");
    }
});

// ✅ Handle Deleting Menu Item
router.post("/delete/:id", checkAdmin, async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.send("<script>alert('Menu Item Deleted Successfully!'); window.location='/menu';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server Error! Try Again.'); window.location='/menu';</script>");
    }
});

// ✅ Fetch Cart Items from MongoDB
router.get("/cart", async (req, res) => {
    try {
        const cart = await CartItem.find({ userId: req.session.user?._id || "guest" });
        res.json(cart);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json([]);
    }
});

// ✅ Add Item to MongoDB Cart
router.post("/cart/add", async (req, res) => {
    try {
        const { itemId, name, price } = req.body;
        let userId = req.session.user ? req.session.user._id : "guest";

        let cartItem = await CartItem.findOne({ userId, itemId });

        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cartItem = new CartItem({ userId, itemId, name, price, quantity: 1 });
        }

        await cartItem.save();
        res.json({ success: true });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false });
    }
});

// ✅ Remove Item from Cart
router.post("/cart/remove", async (req, res) => {
    try {
        let userId = req.session.user ? req.session.user._id : "guest";
        await CartItem.findOneAndDelete({ userId, itemId: req.body.itemId });
        res.json({ success: true });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ success: false });
    }
});

// ✅ Clear Cart after Checkout
router.post("/cart/clear", async (req, res) => {
    try {
        let userId = req.session.user ? req.session.user._id : "guest";
        await CartItem.deleteMany({ userId });
        res.json({ success: true });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
