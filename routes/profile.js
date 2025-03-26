const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middlewares/auth");
const User = require("../models/user");
const Order = require("../models/orders"); // ✅ Ensure this is correct path

// ✅ GET - Profile Page with Orders
router.get("/profile", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);

    // ✅ Fetch orders for the user by email or ID (depending on how you store it)
    const orders = await Order.find({ email: user.email });

    res.render("profile", { user, orders }); // ✅ Pass both user and orders
  } catch (error) {
    console.error("❌ Error loading profile:", error);
    res.status(500).send("Something went wrong");
  }
});

// ✅ POST - Update Profile Info
router.post("/profile", requireLogin, async (req, res) => {
  try {
    const { firstName, lastName, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.session.user.id,
      { firstName, lastName, address },
      { new: true }
    );

    req.session.user.firstName = user.firstName; // ✅ Update session name
    res.redirect("/profile");
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).send("Error updating profile");
  }
});

module.exports = router;
