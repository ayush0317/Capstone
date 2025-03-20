const express = require("express");
const router = express.Router();
const Order = require("../models/orders");

// ✅ Middleware to Restrict Access to Admins
router.use((req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/login");
    }
    next();
});

// ✅ Fetch Orders for Reports
router.get("/", async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const orderHistory = await Order.find().sort({ createdAt: -1 });

        res.render("reports", {
            totalOrders,
            orderHistory
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).send("Error loading reports.");
    }
});

module.exports = router;
