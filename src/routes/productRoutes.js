const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// 🟢 Create Product
router.post("/create", productController.createProduct);

// 🟢 Update Product
router.put("/:id", productController.updateProduct);

// 🟢 Delete Product
router.delete("/:id", productController.deleteProduct);

// 🟢 Create Variant Type
router.post("/variant-types", productController.createVariantType);

// 🟢 Delete Variant Type
router.delete("/variant-types/:id", productController.deleteVariantType);

// 🟢 Create Variants for a Product
router.post("/variants", productController.createVariants);

// 🟢 Update Variant
router.put("/variants/:id", productController.updateVariant);

// 🟢 Delete Variant
router.delete("/variants/:id", productController.deleteVariant);

// 🟢 Get Product with Variants
router.get("/:id", productController.getProductWithVariants);

// 🟢 Get Specific Variant
router.post("/variants/find", productController.getVariant);

module.exports = router;
