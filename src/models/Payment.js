// models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ["wallet", "paystack", "ligdicash"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "successful", "failed"],
    default: "pending",
  },

  items: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  gatewayReference: { type: String },
  reference: { type: String, unique: true, required: true }, // Paystack ref or internal
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", PaymentSchema);
