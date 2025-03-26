const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],

    totalPrice: { type: Number, required: true, min: 0 },

    // paymentMethod: {
    //   type: String,
    //   enum: [
    //     "Credit Card",
    //     "PayPal",
    //     "Crypto",
    //     "Bank Transfer",
    //     "Cash on Delivery",
    //   ],
    //   required: true,
    // },

    // shippingAddress: {
    //   street: { type: String, required: true },
    //   city: { type: String, required: true },
    //   state: { type: String, required: true },
    //   country: { type: String, required: true },
    //   postalCode: { type: String, required: true },
    // },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Canceled"],
      default: "Pending",
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
