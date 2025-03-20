const express = require("express");
const router = express.Router();
const Reservation = require("../models/reservation");
const nodemailer = require("nodemailer");

// ✅ Send Confirmation Email
async function sendEmail(to, reservationDetails) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ayushpatel171104@gmail.com",
            pass: "nuod pjwg spon oeeq"
        }
    });

    let mailOptions = {
        from: "ayushpatel171104@gmail.com",
        to,
        subject: "Your Table Reservation is Confirmed! 🎉",
        text: `Your table has been reserved at ${reservationDetails.restaurant} on ${reservationDetails.date} at ${reservationDetails.time} for ${reservationDetails.guests} guests.`
    };

    return transporter.sendMail(mailOptions);
}

// ✅ Handle Reservation Request
router.post("/", async (req, res) => {
    try {
        const { restaurant, guests, date, time, email } = req.body;
        const reservation = new Reservation({ restaurant, guests, date, time, email });

        await reservation.save();
        await sendEmail(email, reservation);
        
        res.json({ success: true, message: "Reservation confirmed!" });
    } catch (error) {
        res.json({ success: false, message: "Error processing reservation." });
    }
});

module.exports = router;
