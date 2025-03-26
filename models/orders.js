const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  paymentMethod: String,
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "Preparing" // Optional: Set default value
  }
});

module.exports = mongoose.model("Order", orderSchema);
