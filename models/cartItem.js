const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 }  // ✅ Default quantity is 1
});

module.exports = mongoose.model("CartItem", cartItemSchema);
