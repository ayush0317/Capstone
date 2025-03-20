const express = require("express");
const router = express.Router();
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
router.post("/remove", async (req, res) => {
    try {
        const { itemId } = req.body;

        console.log(`🔍 Received request to remove item ID: ${itemId}`); // ✅ Debugging

        if (!itemId) {
            console.error("❌ Error: No Item ID provided");
            return res.status(400).json({ success: false, message: "Item ID is required" });
        }

        // ✅ Validate if `itemId` is a valid ObjectId (MongoDB format)
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            console.error("❌ Invalid ObjectId format:", itemId);
            return res.status(400).json({ success: false, message: "Invalid item ID format" });
        }

        const deletedItem = await CartItem.findByIdAndDelete(itemId);
        
        if (!deletedItem) {
            console.error("❌ Item not found in the database:", itemId);
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        console.log("✅ Successfully removed item:", deletedItem);
        res.json({ success: true, message: "Item removed successfully" });

    } catch (error) {
        console.error("❌ Error removing item:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ✅ Add Item to Cart (Fixing Quantity Issue)
router.post("/add", async (req, res) => {
    try {
        const { name, price } = req.body;
        let existingItem = await CartItem.findOne({ name });

        if (existingItem) {
            existingItem.quantity += 1;  // ✅ Properly increment quantity
            await existingItem.save();
        } else {
            const newCartItem = new CartItem({ name, price, quantity: 1 });
            await newCartItem.save();
        }

        let updatedCart = await CartItem.find();
        res.json({ success: true, cart: updatedCart });  // ✅ Return updated cart
    } catch (error) {
        res.status(500).json({ message: "Error adding item to cart" });
    }
});

// ✅ Remove Item from Cart
router.post("/remove", async (req, res) => {
    try {
        await CartItem.findByIdAndDelete(req.body.itemId);
        let updatedCart = await CartItem.find();
        res.json({ success: true, cart: updatedCart });  // ✅ Return updated cart
    } catch (error) {
        res.status(500).json({ success: false, message: "Error removing item" });
    }
});

// ✅ Clear Cart (After Checkout)
router.post("/clear", async (req, res) => {
    try {
        await CartItem.deleteMany({});
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error clearing cart" });
    }
});
// ✅ Increase Item Quantity
router.post("/increase", async (req, res) => {
    try {
        const { itemId } = req.body;
        let item = await CartItem.findById(itemId);

        if (item) {
            item.quantity += 1;
            await item.save();
        }

        let updatedCart = await CartItem.find();
        res.json({ success: true, cart: updatedCart });
    } catch (error) {
        console.error("❌ Error increasing item quantity:", error);
        res.status(500).json({ success: false, message: "Error updating cart" });
    }
});

module.exports = router;
