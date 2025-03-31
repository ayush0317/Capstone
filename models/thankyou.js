const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  email: String,
  rating: Number,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
