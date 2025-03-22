const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const Reservation = require("../models/reservation");

const fs = require("fs");
const { Parser } = require("json2csv");
router.get("/reports", async (req, res) => {
    try {
        const orderHistory = await Order.find().sort({ createdAt: -1 });
        const reservations = await Reservation.find();

        // Get Top Items
        const allItems = orderHistory.flatMap(order => order.items);
        const itemCounts = {};

        allItems.forEach(item => {
            if (!itemCounts[item.name]) itemCounts[item.name] = 0;
            itemCounts[item.name] += item.quantity || 1;
        });

        const topItems = Object.entries(itemCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.render("adminReports", {
            totalOrders: orderHistory.length,
            totalRevenue: orderHistory.reduce((acc, cur) => acc + cur.totalAmount, 0),
            reservationCount: reservations.length,
            uniqueCustomers: new Set(orderHistory.map(order => order.email)).size,
            orderHistory,
            topItems
        });
    } catch (err) {
        console.error("❌ Error in reports route:", err);
        res.status(500).send("Something went wrong");
    }
});
// ✅ Export Orders to CSV
router.get("/reports/export/csv", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        const fields = ["name", "email", "address", "paymentMethod", "totalAmount", "createdAt"];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(orders);

        res.header("Content-Type", "text/csv");
        res.attachment("orders-report.csv");
        res.send(csv);
    } catch (err) {
        console.error("❌ Error exporting orders to CSV:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
