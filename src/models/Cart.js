const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"],
      default: 1,
    },
    price: {
      type: Number,
      required: true, // ✅ Use price at time of adding to cart
    },
    shippingCost: {
      type: Number,
      default: 0, // ✅ Optional, can calculate dynamically
    },
  },
  { _id: false } // ✅ Prevent sub-document ID if not needed
);

// ✅ Main Cart Schema
const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ One cart per user
    },
    items: {
      type: [CartItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Cart must have at least one item",
      },
    },
  },
  { timestamps: true }
);

// ✅ Virtual for subtotal
CartSchema.virtual("subTotal").get(function () {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

// ✅ Ensure virtual fields are included in JSON
CartSchema.set("toJSON", { virtuals: true });
CartSchema.set("toObject", { virtuals: true });

// ✅ Add index for faster user lookup
CartSchema.index({ userId: 1 });

module.exports = mongoose.model("Cart", CartSchema);
