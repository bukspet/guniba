const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    method: {
      type: String,
      enum: ["automatic", "discountcode"],
      required: true,
    },

    code: {
      type: String,
      uppercase: true,
      trim: true,
      required: function () {
        return this.method === "discountcode";
      },
    },

    categories: [{ type: String }], // Can be category names or IDs
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    discountType: {
      type: String,
      enum: ["Amount off products"], // Only 1 allowed for now
      default: "Amount off products",
    },

    amountType: {
      type: String,
      enum: ["fixed", "percent"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["draft", "active", "expired", "canceled"],
      default: "draft",
    },

    toDisplay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;
