// routes/thankyou.js
const express = require("express");
const router = express.Router();
const Feedback = require("../models/thankyou");

// ✅ Render Thank You Page
router.get("/", (req, res) => {
  res.render("thankyou");
});

// ✅ Handle Feedback Submission
router.post("/feedback", async (req, res) => {
  const { rating, email } = req.body;
  try {
    await Feedback.create({ rating, email });
    res.redirect("/"); // After submitting feedback, go to home
  } catch (error) {
    console.error("❌ Feedback Error:", error);
    res.status(500).send("Something went wrong.");
  }
});

module.exports = router;
