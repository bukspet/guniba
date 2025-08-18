const productService = require("../services/productService");
const localCache = require("../config/localCache");
// ✅ Create a new product
const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const setTemporalFalse = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await productService.setProductPermanent(id);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Temporal field updated", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Create a new variant type
const createVariantType = async (req, res) => {
  try {
    const variantType = await productService.createVariantType(req.body);
    res.status(201).json(variantType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Create product variants
const createVariants = async (req, res) => {
  try {
    const { productId, variants } = req.body;
    const createdVariants = await productService.createVariants(
      productId,
      variants
    );
    res.status(201).json(createdVariants);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Get product with variants
const getProductWithVariants = async (req, res) => {
  try {
    const product = await productService.getProductWithVariants(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllProductsWithVariants = async (req, res) => {
  try {
    const { search, ...filters } = req.query;

    // Build a unique cache key
    // const cacheKey = `products:${JSON.stringify(req.query)}`;

    // 1. Check local in-memory cache
    // const cachedData = localCache.get(cacheKey);
    // if (cachedData) {
    //   console.log("✅ Local cache hit for", cacheKey);
    //   return res.status(200).json(cachedData);
    // }

    // console.log("❌ Local cache miss for", cacheKey);

    // Prepare filters
    const priceFilter = {};
    if (req.query.under) priceFilter.under = parseInt(req.query.under);
    else if (req.query.above) priceFilter.above = parseInt(req.query.above);
    else if (req.query.between) {
      const betweenValues = req.query.between.split(",").map(Number);
      if (betweenValues.length === 2) priceFilter.between = betweenValues;
    }

    const ratingFilter = {};
    if (req.query.ratingAbove) {
      ratingFilter.above = parseInt(req.query.ratingAbove);
    }

    const sort = {};
    if (req.query.sortPrice) {
      sort.price = req.query.sortPrice;
    }

    // 2. Fetch from MongoDB
    const response = await productService.getAllProductsWithVariants(
      filters,
      search,
      priceFilter,
      ratingFilter,
      sort
    );

    // 3. Save to cache for 5 minutes
    // if (response.success) {
    //   localCache.set(cacheKey, response);
    // }

    res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: [],
    });
  }
};

// ✅ Get variant by selected options
const getVariant = async (req, res) => {
  try {
    const { productId, selectedVariants } = req.body;

    // Validate input
    if (
      !productId ||
      !Array.isArray(selectedVariants) ||
      selectedVariants.length === 0
    ) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const variant = await productService.findVariant(
      productId,
      selectedVariants
    );

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.status(200).json(variant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllVariants = async (req, res) => {
  try {
    const variants = await productService.getAllVariants();
    res.status(200).json({ success: true, data: variants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update a Product
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Delete a Product (and its variants)
const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Update a Variant
const updateVariant = async (req, res) => {
  try {
    const updatedVariant = await productService.updateVariant(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedVariant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Delete a Variant
const deleteVariant = async (req, res) => {
  try {
    await productService.deleteVariant(req.params.id);
    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Delete a Variant Type
const deleteVariantType = async (req, res) => {
  try {
    await productService.deleteVariantType(req.params.id);
    res.status(200).json({ message: "Variant type deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  createVariantType,
  createVariants,
  getProductWithVariants,
  getAllProductsWithVariants,
  getVariant,
  getAllVariants,
  updateProduct,
  deleteProduct,
  updateVariant,
  deleteVariant,
  deleteVariantType,
  setTemporalFalse,
};
