const express = require("express");
const router = express.Router();
const Table = require("../models/table");

// ✅ Fetch Tables for Selected Location
router.get("/tableBooking", async (req, res) => {
    try {
        const tables = await Table.find(); // Fetch all tables
        res.render("tableBooking", { tables });
    } catch (error) {
        console.error("❌ Error fetching tables:", error);
        res.status(500).send("Error loading tables");
    }
});

// ✅ Handle Table Booking
router.post("/bookTable/:id", async (req, res) => {
    try {
        const tableId = req.params.id;
        const table = await Table.findById(tableId);

        if (!table) {
            return res.status(404).json({ success: false, message: "Table not found" });
        }

        if (table.isBooked) {
            return res.status(400).json({ success: false, message: "Table is already booked" });
        }

        table.isBooked = true;
        await table.save();

        res.json({ success: true });
    } catch (error) {
        console.error("❌ Booking Error:", error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
