const { Product, Variant, VariantType } = require("../models/product");
const slugify = require("slugify");
// 🟢 Create a new product
async function createProduct(data) {
  try {
    console.log("Incoming Data:", data);

    const {
      name,
      category,
      brand,
      tags,
      price,
      promoPrice,
      images,
      description,
      variantTypes,
      SKU,
    } = data;

    // ✅ Generate slug from product name
    let slug = slugify(name, { lower: true, strict: true });

    // ✅ Ensure slug uniqueness
    let existingProduct = await Product.findOne({ slug });
    let uniqueSlug = slug;
    let counter = 1;
    while (existingProduct) {
      uniqueSlug = `${slug}-${counter}`;
      existingProduct = await Product.findOne({ slug: uniqueSlug });
      counter++;
    }

    // ✅ Fetch variant types from DB
    const variantTypeData = await VariantType.find({
      _id: { $in: variantTypes },
    });

    if (!variantTypeData.length) {
      throw new Error("Variant types not found");
    }

    // ✅ Extract values [{ subname, image }]
    let variantValues = variantTypeData.map((vt) =>
      vt.values.map((v) => ({ subname: v.subname, image: v.image || null }))
    );

    // ✅ Generate all possible variant combinations
    let variantCombinations = generateCombinations(variantValues);

    // ✅ Map variant types for additional details
    const otherDetails = {
      SKU, // Inherit from product
      variants: variantTypeData.map((variant) => ({
        typeName: variant.name,
        subnames: variant.values.map((value) => value.subname),
      })),
    };

    // ✅ Create and save product
    const product = await Product.create({
      name,
      slug: uniqueSlug,
      category,
      brand,
      tags,
      SKU,
      price,
      promoPrice,
      images,
      description,
      variantTypes,
    });

    console.log("Product Saved:", product);

    if (!product) {
      throw new Error("Product creation failed");
    }

    // ✅ Create variant documents
    let variantDocs = variantCombinations.map((combination) => ({
      productId: product._id,
      combinations: combination.map((value, index) => ({
        typeId: variantTypeData[index]._id,
        subname: value.subname,
        image: value.image,
      })),
      stock: 10,
      price,
      promoPrice,
    }));

    // ✅ Save variants in DB
    const savedVariants = await Variant.insertMany(variantDocs);
    console.log("Saved Variants:", savedVariants);

    // ✅ Update product with variants
    product.variants = savedVariants.map((v) => v._id);
    await product.save();

    return { product, variants: savedVariants, otherDetails };
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw new Error(error.message);
  }
}

// Helper function to generate combinations
function generateCombinations(arrays, prefix = []) {
  if (!arrays.length) return [prefix];
  const [first, ...rest] = arrays;
  return first.flatMap((value) =>
    generateCombinations(rest, [...prefix, value])
  );
}

// 🟢 Create a variant type
const createVariantType = async (variantTypeData) => {
  return await VariantType.create(variantTypeData);
};

// 🟢 Create variants based on combinations
const createVariants = async (productId, variantsData) => {
  const createdVariants = await Variant.insertMany(
    variantsData.map((variant) => ({ ...variant, productId }))
  );

  // Update product with new variant references
  await Product.findByIdAndUpdate(productId, {
    $push: { variants: { $each: createdVariants.map((v) => v._id) } },
  });

  return createdVariants;
};

// 🟢 Get product with variants
const getProductWithVariants = async (productId) => {
  return await Product.findById(productId)
    .populate("variantTypes")
    .populate({
      path: "variants",
      populate: {
        path: "combinations.typeId",
        select: "name",
      },
    })
    .populate({
      path: "reviews",
      populate: [
        {
          path: "userId",
          select: "fullName avatar",
        },
        {
          path: "variantId",
          select: "combinations",
          populate: {
            path: "combinations.typeId",
            select: "name",
          },
        },
      ],
    })
    .lean()
    .then((product) => {
      if (!product) return null;

      // Transform variants to include subnames array
      product.variants = product.variants.map((variant) => ({
        ...variant,
        subnames: variant.combinations.map((combo) => combo.subname), // Extract subnames
      }));

      // Transform reviews to include user details & variant subnames
      product.reviews = product.reviews.map((review) => ({
        ...review,
        user: {
          fullName: review.userId?.fullName || "Anonymous",
          avatar: review.userId?.avatar || null,
        },
        variantSubnames: review.variantId
          ? review.variantId.combinations.map((combo) => combo.subname)
          : [], // Extract subnames if variant exists
      }));

      return product;
    });
};

// 🟢 Find a specific variant based on selected options
const findVariant = async (productId, selectedVariants) => {
  return await Variant.findOne({
    productId,
    "combinations.subname": { $all: selectedVariants }, // Match subnames
  }).populate("combinations.typeId", "name"); // Populate typeId with name
};

const updateProduct = async (productId, updateData) => {
  return await Product.findByIdAndUpdate(productId, updateData, { new: true });
};

// 🟢 Delete a product and its variants
const deleteProduct = async (productId) => {
  await Variant.deleteMany({ productId }); // Delete related variants
  return await Product.findByIdAndDelete(productId);
};

// 🟢 Update a variant
const updateVariant = async (variantId, updateData) => {
  return await Variant.findByIdAndUpdate(variantId, updateData, { new: true });
};

// 🟢 Delete a variant
const deleteVariant = async (variantId) => {
  return await Variant.findByIdAndDelete(variantId);
};

// 🟢 Delete a variant type (ensure it's removed from products)
const deleteVariantType = async (variantTypeId) => {
  await Product.updateMany({}, { $pull: { variantTypes: variantTypeId } });
  return await VariantType.findByIdAndDelete(variantTypeId);
};

module.exports = {
  createProduct,
  createVariantType,
  createVariants,
  getProductWithVariants,
  findVariant,
  updateProduct,
  deleteProduct,
  updateVariant,
  deleteVariant,
  deleteVariantType,
};
