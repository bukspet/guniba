const { Product, Variant, VariantType } = require("../models/Product");
const slugify = require("slugify");
const { applyDiscountIfApplicable } = require("../services/discountService");
// 🟢 Create a new product
async function createProduct(data) {
  try {
    console.log("Incoming Data:", data);

    const {
      name,
      category,
      brand,
      tags,
      productDetails,
      price,
      images,
      keyInformation,
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

    // ✅ Mark used variant types as used: true
    await VariantType.updateMany(
      { _id: { $in: variantTypes } },
      { $set: { used: true } }
    );

    // ✅ Remove unused variant types (used: false)
    await VariantType.deleteMany({ used: false });

    // ✅ Extract values [{ subname, image }]
    let variantValues = variantTypeData.map((vt) =>
      vt.values.map((v) => ({ subname: v.subname, image: v.image || null }))
    );

    // ✅ Generate all possible variant combinations
    let variantCombinations = generateCombinations(variantValues);

    // ✅ Map variant types for additional details
    const otherDetails = {
      SKU,
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

      images,
      description,
      variantTypes,
    });

    console.log("Product Saved:", product);

    if (!product) {
      throw new Error("Product creation failed");
    }

    // ✅ Create variant documents
    const variantDocs = variantCombinations.map((combination) => ({
      productId: product._id,
      combinations: combination.map((value, index) => ({
        typeId: variantTypeData[index]._id,
        subname: value.subname,
        image: value.image,
      })),
      stock: 10,
      price,
    }));

    // ✅ Save variants
    const savedVariants = await Variant.insertMany(variantDocs);
    console.log("Saved Variants:", savedVariants);

    // ✅ Attach variants to product
    product.variants = savedVariants.map((v) => v._id);
    await product.save();

    return { product };
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw new Error(error.message);
  }
}

// Helper f  unction to generate combinations
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
const getProductWithVariants = async (productId, userCode = null) => {
  try {
    const product = await Product.findById(productId)
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
      .lean();

    if (!product) {
      return {
        success: false,
        message: "Product not found",
        data: null,
      };
    }

    // Get applicable discount for this product/category
    const discount = await applyDiscountIfApplicable(
      product._id,
      product.category,
      userCode
    );

    // Transform variants: subnames + discounted price
    product.variants = product.variants.map((variant) => {
      let discountedPrice = variant.price;
      let discountInfo = null;

      if (discount) {
        if (discount.amountType === "fixed") {
          discountedPrice = Math.max(0, variant.price - discount.amount);
        } else if (discount.amountType === "percent") {
          discountedPrice = Math.max(
            0,
            variant.price * (1 - discount.amount / 100)
          );
        }

        discountInfo = {
          id: discount._id,
          name: discount.name,
          method: discount.method,
          code: discount.method === "discountcode" ? discount.code : null,
        };
      }

      return {
        ...variant,
        subnames: variant.combinations.map((combo) => combo.subname),
        originalPrice: variant.price,
        discountedPrice,
        discount: discountInfo,
      };
    });

    // Transform reviews to include user details & variant subnames
    product.reviews = product.reviews.map((review) => ({
      ...review,
      user: {
        fullName: review.userId?.fullName || "Anonymous",
        avatar: review.userId?.avatar || null,
      },
      variantSubnames: review.variantId
        ? review.variantId.combinations.map((combo) => combo.subname)
        : [],
    }));

    return {
      success: true,
      message: "Product fetched successfully",
      data: product,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error fetching product: ${error.message}`,
      data: null,
    };
  }
};

const setProductPermanent = async (productId) => {
  // Set the specified product as permanent (temporal: false)
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { temporal: false },
    { new: true }
  );

  if (!updatedProduct) {
    throw new Error("Product not found or update failed");
  }

  // Delete all other products that are still temporal
  await Product.deleteMany({
    _id: { $ne: productId }, // exclude the updated product
    temporal: true,
  });

  return updatedProduct;
};

const getAllProductsWithVariants = async (
  filters = {},
  search = "",
  priceFilter = {},
  ratingFilter = {},
  sort = {}
) => {
  try {
    const searchRegex = search ? new RegExp(search, "i") : null;
    console.log(
      new Date(),
      "Service: Fetching products with search:",
      search,
      "filters:",
      filters
    );
    const searchFilter = searchRegex
      ? {
          $or: [
            { name: searchRegex },
            { category: searchRegex },
            { brand: searchRegex },
            { tags: searchRegex },
          ],
        }
      : {};

    let priceQuery = {};

    if (priceFilter.under) {
      priceQuery.price = { $lte: priceFilter.under };
    } else if (priceFilter.above) {
      priceQuery.price = { $gte: priceFilter.above };
    } else if (priceFilter.between) {
      priceQuery.price = {
        $gte: priceFilter.between[0],
        $lte: priceFilter.between[1],
      };
    }

    let ratingQuery = {};

    if (ratingFilter.above) {
      ratingQuery.rating = { $gte: ratingFilter.above };
    }

    const query = {
      ...filters,
      ...searchFilter,
      ...priceQuery,
      ...ratingQuery,
      temporal: false,
    };

    let mongoSort = {};
    if (sort.price) {
      mongoSort.price = sort.price === "desc" ? -1 : 1;
    }

    const products = await Product.find(query)
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
      .sort(mongoSort)
      .lean();

    const transformedProducts = products.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        subnames: variant.combinations.map((combo) => combo.subname),
      })),
      reviews: product.reviews.map((review) => ({
        ...review,
        user: {
          fullName: review.userId?.fullName || "Anonymous",
          avatar: review.userId?.avatar || null,
        },
        variantSubnames: review.variantId
          ? review.variantId.combinations.map((combo) => combo.subname)
          : [],
      })),
    }));

    return {
      success: true,
      message: "Products fetched successfully",
      data: transformedProducts,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error fetching products: ${error.message}`,
      data: [],
    };
  }
};

const getAllVariants = async () => {
  try {
    const variants = await Variant.find();
    return variants;
  } catch (error) {
    console.error("Error fetching variants:", error);
    throw new Error("Failed to fetch variants");
  }
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
  getAllVariants,
  updateProduct,
  deleteProduct,
  updateVariant,
  deleteVariant,
  getAllProductsWithVariants,
  deleteVariantType,
  setProductPermanent,
};
