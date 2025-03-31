const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const CartItem = require("../models/cartItem");
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const fontPath = path.join(__dirname, "../public/fonts/Roboto-Regular.ttf"); 
const { requireLogin } = require("../middlewares/auth"); 
const receiptsDir = path.join(__dirname, "..", "receipts");
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir);
}

const doc = new PDFDocument();
const filePath = path.join(receiptsDir, `receipt-${Date.now()}.pdf`);
doc.pipe(fs.createWriteStream(filePath));

// ✅ Send Confirmation Email with HTML
async function sendEmail(to, orderDetails) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ayushpatel171104@gmail.com",
            pass: "nuod pjwg spon oeeq"
        }
    });

    // HTML content (for both email and PDF)
    const itemsHTML = orderDetails.items.map(item =>
        `<li>${item.quantity} x ${item.name} – ₹${item.price * item.quantity}</li>`
    ).join("");

    const htmlContent = `
        <h2>🍽️ Order Confirmation</h2>
        <p>Hello <strong>${orderDetails.name}</strong>,</p>
        <p>Your order has been placed successfully! 🎉</p>
        <hr>
        <p><strong>📍 Delivery Address:</strong> ${orderDetails.address}</p>
        <p><strong>💳 Payment Method:</strong> ${orderDetails.paymentMethod}</p>
        <p><strong>🛍️ Ordered Items:</strong></p>
        <ul>${itemsHTML}</ul>
        <hr>
        <h3>Total Amount: ₹${orderDetails.totalAmount}</h3>
    `;

    // ✅ Generate PDF Receipt
    const pdfDoc = new PDFDocument();
    const pdfPath = path.join(__dirname, "../receipts", `receipt-${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(pdfPath);
    pdfDoc.pipe(writeStream);

    // ✅ Load default or custom font
    if (fs.existsSync(fontPath)) {
        pdfDoc.font(fontPath);  // Use Roboto if available
    } else {
        pdfDoc.font('Helvetica'); // Fallback
    }
    
    // ✅ Header
    pdfDoc
      .fillColor("#e74c3c")
      .fontSize(22)
      .text("Restaurant Name", { align: "center" })
      .moveDown(0.5);
    
    pdfDoc
      .fillColor("#333")
      .fontSize(16)
      .text("Order Confirmation Receipt", { align: "center" })
      .moveDown(1);
    
    // ✅ Customer Info
    pdfDoc
      .fontSize(12)
      .fillColor("#000")
      .text(`Customer Name: ${orderDetails.name}`)
      .text(`Email: ${to}`)
      .text(`Address: ${orderDetails.address}`)
      .text(`Payment Method: ${orderDetails.paymentMethod}`)
      .moveDown();
    
    // ✅ Divider
    pdfDoc
      .moveTo(50, pdfDoc.y)
      .lineTo(550, pdfDoc.y)
      .strokeColor("#bbb")
      .stroke()
      .moveDown();
    
    // ✅ Items List
    pdfDoc.fontSize(13).text("Ordered Items:", { underline: true }).moveDown(0.5);
    
    orderDetails.items.forEach(item => {
      pdfDoc.text(`• ${item.quantity} x ${item.name} = ₹${item.price * item.quantity}`);
    });
    
    pdfDoc.moveDown();
    
    // ✅ Total
    pdfDoc
      .fontSize(14)
      .fillColor("#27ae60")
      .text(`Total Amount: ₹${orderDetails.totalAmount}`, { align: "right" })
      .moveDown();
    
    // ✅ Footer
    pdfDoc
      .fontSize(10)
      .fillColor("#999")
      .text("Thank you for ordering with us!", { align: "center", lineGap: 4 })
      .text("This is an auto-generated receipt. Please do not reply.", { align: "center" });
    
    pdfDoc.end();
    // ✅ Send Email After PDF is Written
    writeStream.on('finish', async () => {
        let mailOptions = {
            from: '"Restaurant Name" <ayushpatel171104@gmail.com>',
            to,
            subject: "🛒 Order Confirmation - Restaurant Name",
            html: `
                <div style="font-family: Arial; background: #f8f9fa; padding: 30px;">
                    ${htmlContent}
                    <p style="margin-top: 30px;">Thank you for ordering with us! Bon Appétit! 🍕</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'OrderReceipt.pdf',
                    path: pdfPath,
                    contentType: 'application/pdf'
                }
            ]
        };

        try {
            let info = await transporter.sendMail(mailOptions);
            console.log("✅ Email with receipt sent:", info.response);
        } catch (error) {
            console.error("❌ Error sending email:", error);
        }
    });
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
router.get("/past-orders", requireLogin, async (req, res) => {
    try {
        const userEmail = req.session.user.email;

        // Fetch orders for the logged-in user
        const orders = await Order.find({ email: userEmail }).sort({ createdAt: -1 });

        const latestOrderId = orders.length > 0 ? orders[0]._id.toString() : null;

        res.render("pastorders", { orders, latestOrderId });
    } catch (err) {
        console.error("❌ Error loading past orders:", err);
        res.status(500).send("Failed to load past orders.");
    }
});
// ✅ Thank You Page (GET)
router.get("/", (req, res) => {
    res.render("thankyou");
});

// ✅ Feedback Submission (POST)
router.post("/", async (req, res) => {
    const { rating, email } = req.body;
    try {
        await Feedback.create({ rating, email });
        res.redirect("/"); // or redirect to confirmation
    } catch (error) {
        console.error("❌ Feedback Save Error:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;
