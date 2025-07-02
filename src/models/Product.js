const mongoose = require("mongoose");

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

const ReadyToReview = mongoose.model("ReadyToReview", readyToReviewSchema);

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
    images: [
      {
        type: String, // Could be a URL or Cloudinary public_id, etc.
      },
    ],
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
    SKU: { type: String, index: true },
    tags: [{ type: String, index: true }],
    price: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, min: 0 },
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
    stock: { type: Number, default: 0, min: 0 }, // ✅ stored in DB, updated via middleware
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    temporal: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual for live calculation if variants are populated
productSchema.virtual("computedStock").get(function () {
  if (!this.variants || !Array.isArray(this.variants)) return 0;
  return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
});

// ✅ Static: Calculate stock from populated variants only
productSchema.statics.getProductStock = async function (productId) {
  const product = await this.findById(productId).populate("variants").exec();
  if (!product) throw new Error("Product not found");

  const totalStock = product.variants.reduce(
    (sum, variant) => sum + (variant.stock || 0),
    0
  );

  return totalStock;
};

// ✅ Static: Return full product and attach computed stock to `.stock` field
productSchema.statics.findWithStock = async function (productId) {
  const product = await this.findById(productId).populate("variants").lean();
  if (!product) throw new Error("Product not found");

  product.stock = product.variants.reduce(
    (sum, variant) => sum + (variant.stock || 0),
    0
  );

  return product;
};

const Product = mongoose.model("Product", productSchema);

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
    available: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Declare Variant model after schema definition to use inside middleware
const Variant = mongoose.model("Variant", variantSchema);

// ✅ Middleware to update product stock on save
variantSchema.post("save", async function () {
  try {
    const variants = await Variant.find({ productId: this.productId });
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    const Product = require("./Product"); // Adjust path if needed
    await Product.findByIdAndUpdate(this.productId, { stock: totalStock });
  } catch (err) {
    console.error("Error updating product stock on variant save:", err);
  }
});

// ✅ Middleware to update product stock on delete
variantSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  try {
    const variants = await Variant.find({ productId: doc.productId });
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    const Product = require("./Product");
    await Product.findByIdAndUpdate(doc.productId, { stock: totalStock });
  } catch (err) {
    console.error("Error updating product stock on variant delete:", err);
  }
});

const variantTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  values: [
    {
      subname: { type: String, required: true },
      image: { type: String },
    },
  ],
  used: { type: Boolean, default: false },
});

variantTypeSchema.index({ name: 1 }, { unique: false });

const VariantType = mongoose.model("VariantType", variantTypeSchema);

module.exports = VariantType;

module.exports = { Product, VariantType, Variant, Review, ReadyToReview };
