const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
    locationId: String,
    x: Number,
    y: Number,
    isBooked: Boolean
});

module.exports = mongoose.model("Table", TableSchema);
