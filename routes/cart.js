const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const CartItem = require("../models/cartItem");

// ✅ Get All Cart Items
router.get("/items", async (req, res) => {
  try {
    const cartItems = await CartItem.find();
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
});

// ✅ Add Item to Cart
router.post("/add", async (req, res) => {
  try {
    const { name, price } = req.body;
    let existingItem = await CartItem.findOne({ name });

    if (existingItem) {
      existingItem.quantity += 1;
      await existingItem.save();
    } else {
      const newCartItem = new CartItem({ name, price, quantity: 1 });
      await newCartItem.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart" });
  }
});

// ✅ Update Item Quantity (increase or decrease)
router.post("/update", async (req, res) => {
  try {
    const { itemId, change } = req.body;
    const item = await CartItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.quantity += change;

    if (item.quantity <= 0) {
      await CartItem.findByIdAndDelete(itemId);
    } else {
      await item.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating cart item" });
  }
});

// ✅ Remove Item
router.post("/remove", async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid item ID format" });
    }

    const deletedItem = await CartItem.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing item" });
  }
});

// ✅ Clear Cart
router.post("/clear", async (req, res) => {
  try {
    await CartItem.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error clearing cart" });
  }
});

module.exports = router;
