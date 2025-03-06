const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., "Appetizers", "Main Course"
    type: { type: String, required: true }, // "Vegetarian" or "Non-Vegetarian"
    image: { type: String, required: true } // Image filename, stored in /public/Images/
});

module.exports = mongoose.model("MenuItem", menuItemSchema);    
