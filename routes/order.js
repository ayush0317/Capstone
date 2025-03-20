const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const CartItem = require("../models/cartItem");
const nodemailer = require("nodemailer");

// ✅ Send Confirmation Email
async function sendEmail(to, orderDetails) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
             user: "ayushpatel171104@gmail.com",
            pass: "nuod pjwg spon oeeq"
        }
    });

    let itemsText = orderDetails.items.map(item => 
        `${item.quantity} x ${item.name} - ₹${item.price * item.quantity}`
    ).join("\n");

    let mailOptions = {
        from: "ayushpatel171104@gmail.com",
        to,
        subject: "🛒 Order Confirmation - Restaurant Name",
        text: `Hello ${orderDetails.name},\n\nYour order has been placed successfully!\n\n` +
              `📍 Delivery Address: ${orderDetails.address}\n` +
              `💳 Payment Method: ${orderDetails.paymentMethod}\n` +
              `🛍️ Ordered Items:\n${itemsText}\n\n` +
              `Total Amount: ₹${orderDetails.totalAmount}\n\nThank you for ordering with us! 🍽️`
    };

    return transporter.sendMail(mailOptions);
}

// ✅ Handle Checkout Request
router.post("/checkout", async (req, res) => {
    try {
        const { name, email, address, paymentMethod, items, totalAmount } = req.body;

        const newOrder = new Order({ name, email, address, paymentMethod, items, totalAmount });
        await newOrder.save();  // ✅ Save order in MongoDB
        await CartItem.deleteMany({});  // ✅ Clear cart after order placement
        await sendEmail(email, newOrder);  // ✅ Send confirmation email

        res.json({ success: true });
    } catch (error) {
        console.error("❌ Error processing order:", error);
        res.status(500).json({ success: false, message: "Error processing order." });
    }
});

module.exports = router;
