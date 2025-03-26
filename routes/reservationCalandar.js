// routes/reservationsCalendar.js
const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middlewares/auth");
const Reservation = require("../models/reservation");

// ✅ Admin Calendar View
router.get("/admin/reservations", requireLogin, async (req, res) => {
  try {
    if (!req.session.user.isAdmin) {
      return res.status(403).send("Access denied");
    }

    const reservations = await Reservation.find();
    res.render("reservationsCalendar", { reservations });
  } catch (error) {
    console.error("❌ Error loading reservation calendar:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
