const express = require("express");
const router = express.Router();
const Reservation = require("../models/reservation");
const nodemailer = require("nodemailer");
const { requireLogin } = require("../middlewares/auth");

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
        from: '"Restaurant Name" <ayushpatel171104@gmail.com>',
        to,
        subject: "📅 Table Reservation Confirmation - Restaurant Name",
        html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <h2 style="text-align: center; color: #e67e22;">🍽️ Table Reservation Confirmed!</h2>
                <p>Hi <strong>${reservationDetails.email}</strong>,</p>
                <p>Your reservation has been successfully made at <strong>Restaurant ${reservationDetails.restaurant}</strong>.</p>
    
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    
                <h4 style="color: #2c3e50;">📋 Reservation Details:</h4>
                <ul style="list-style-type: none; padding-left: 0; font-size: 15px;">
                    <li><strong>📅 Date:</strong> ${reservationDetails.date}</li>
                    <li><strong>⏰ Time:</strong> ${reservationDetails.time}</li>
                    <li><strong>👥 Guests:</strong> ${reservationDetails.guests}</li>
                </ul>
    
                <p style="margin-top: 20px;">We’re excited to host you. If you need to make any changes to your reservation, please contact us at least 24 hours in advance.</p>
    
                <div style="margin-top: 30px; text-align: center;">
                    <p style="font-size: 13px; color: #999;">This is a confirmation email from <strong>Restaurant Name</strong>. Please do not reply.</p>
                </div>
            </div>
        </div>
        `
    };
    

    return transporter.sendMail(mailOptions);
}
// 📅 Admin Reservation Calendar
// 📅 Admin Reservation Dashboard
// 📍 routes/reservation.js (admin route)
router.get("/admin-reservations", requireLogin, async (req, res) => {
    try {
      if (!req.session.user.isAdmin) {
        return res.status(403).send("Access Denied");
      }
  
      const reservations = await Reservation.find();
  
      const formatted = reservations.map(r => ({
        title: `Guests: ${r.guests} (${r.time})`,
        start: new Date(r.date).toISOString().split("T")[0], // Ensure it's a date
        extendedProps: {
          email: r.email,
          guests: r.guests,
          time: r.time
        }
      }));
      
      res.render("adminReservations", { reservations: formatted });
      
      
  
    } catch (err) {
      console.error("❌ Calendar Fetch Error:", err);
      res.status(500).send("Error loading reservations");
    }
  });
  

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
