const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
    restaurant: String,
    guests: Number,
    date: String,
    time: String,
    email: String
});

module.exports = mongoose.model("Reservation", ReservationSchema);
