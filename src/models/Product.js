const mongoose = require("mongoose");

// 🟢 Review Schema
const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: false, // Optional in case the review is for the product as a whole
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

// 🟢 Product Schema (Updated with reviews)
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: "text" },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, index: true },
    SKU: { type: String, unique: true, sparse: true, index: true },
    tags: [{ type: String, index: true }],
    price: { type: Number, required: true, min: 0 },
    promoPrice: { type: Number, min: 0, default: null },
    shippingFee: { type: Number, min: 0 },
    images: [{ type: String, required: true }],
    description: { type: String, required: true, index: "text" },
    keyFeatures: { type: String, default: null },

    productDetails: { type: String, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    quantitySold: { type: Number, default: 0, min: 0 },
    variantTypes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "VariantType" },
    ],
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

const variantTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  values: [
    {
      subname: { type: String, required: true },
      image: { type: String },
    },
  ],
});

variantTypeSchema.index({ name: 1 }, { unique: false });

const VariantType = mongoose.model("VariantType", variantTypeSchema);

module.exports = VariantType;

// 🟢 Variant Schema
const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    display: { type: Boolean, default: false },
    combinations: [
      {
        typeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "VariantType",
          required: true,
        },
        subname: { type: String, required: true },
        image: { type: String },
      },
    ],
    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, min: 0 },
    promoPrice: { type: Number, min: 0, default: null },
  },
  { timestamps: true }
);

const Variant = mongoose.model("Variant", variantSchema);

module.exports = { Product, VariantType, Variant, Review };
