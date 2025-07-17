// models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        price: Number,
        quantity: Number,
      },
    ],

    totalPrice: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["wallet", "paystack"], required: true },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Completed", "Return"],
      default: "Processing",
    },

    shippedAt: { type: Date },
    completedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
