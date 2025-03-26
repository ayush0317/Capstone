const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const { requireLogin } = require("../middlewares/auth");

// 🧾 Past Orders Route
router.get("/past-orders", requireLogin, async (req, res) => {
    try {
        const userEmail = req.session.user.email;

        const orders = await Order.find({ email: userEmail }).sort({ createdAt: -1 });
        const latestOrderId = orders.length > 0 ? orders[0]._id.toString() : null;

        res.render("pastorders", { orders, latestOrderId });
    } catch (error) {
        console.error("❌ Failed to load past orders:", error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
