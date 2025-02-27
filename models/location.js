const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    image: { type: String, required: true } // Image URL
});

// ✅ Fix: Prevent OverwriteModelError
module.exports = mongoose.models.Location || mongoose.model("Location", locationSchema);
