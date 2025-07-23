const mongoose = require("mongoose");

/* ===============================
   ReadyToReview Schema
================================= */
const readyToReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  { timestamps: true }
);

/* ===============================
   Review Schema
================================= */
const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

/* ===============================
   Product Schema
================================= */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: "text" },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, index: true },
    SKU: { type: String, index: true },
    tags: [{ type: String, index: true }],
    price: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, min: 0, default: 0 },
    order: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    images: [{ type: String, required: true }],
    description: { type: String, required: true, index: "text" },
    keyFeatures: { type: String, default: null },
    productDetails: { type: String, default: null },
    keyInformation: { type: String, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    quantitySold: { type: Number, default: 0, min: 0 },
    variantTypes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "VariantType" },
    ],
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
    stock: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    temporal: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/* ===============================
   Variant Schema
================================= */
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
    available: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ✅ Middleware: Update product stock on save/delete */
variantSchema.post("save", async function () {
  try {
    const Variant = mongoose.model("Variant");
    const Product = mongoose.model("Product");
    const variants = await Variant.find({ productId: this.productId });
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    await Product.findByIdAndUpdate(this.productId, { stock: totalStock });
  } catch (err) {
    console.error("Error updating product stock:", err);
  }
});

variantSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  try {
    const Variant = mongoose.model("Variant");
    const Product = mongoose.model("Product");
    const variants = await Variant.find({ productId: doc.productId });
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    await Product.findByIdAndUpdate(doc.productId, { stock: totalStock });
  } catch (err) {
    console.error("Error updating product stock:", err);
  }
});

/* ===============================
   VariantType Schema
================================= */
const variantTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  values: [
    { subname: { type: String, required: true }, image: { type: String } },
  ],
  used: { type: Boolean, default: false },
});
variantTypeSchema.index({ name: 1 });

/* ===============================
   Create Models
================================= */
const ReadyToReview = mongoose.model("ReadyToReview", readyToReviewSchema);
const Review = mongoose.model("Review", reviewSchema);
const Product = mongoose.model("Product", productSchema);
const Variant = mongoose.model("Variant", variantSchema);
const VariantType = mongoose.model("VariantType", variantTypeSchema);

/* ===============================
   Export Models
================================= */
module.exports = { Product, Variant, VariantType, Review, ReadyToReview };
