// routes/cartRoutes.ts
const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getCartController,
  addToCartController,
  removeItemController,
  updateQuantityController,
} = require("../controllers/CartController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCartController);
router.post("/", addToCartController);
router.delete("/:variantId", removeItemController);
router.patch("/:variantId", updateQuantityController);

module.exports = router;
