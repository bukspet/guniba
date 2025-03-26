const productService = require("../services/productService");

// ✅ Create a new product
const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
}; // ✅ Update a Product
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
  getVariant,
  updateProduct,
  deleteProduct,
  updateVariant,
  deleteVariant,
  deleteVariantType,
};
