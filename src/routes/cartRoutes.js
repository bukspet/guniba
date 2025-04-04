const express = require("express");
const CartController = require("../controllers/CartController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/cart", authMiddleware, CartController.addToCart);
router.delete(
  "/cart/:variantId",
  authMiddleware,
  CartController.removeFromCart
);
router.get("/cart", authMiddleware, CartController.getUserCart);

router.post("/wishlist", authMiddleware, CartController.addToWishlist);
router.delete(
  "/wishlist/:productId",
  authMiddleware,
  CartController.removeFromWishlist
);
router.get("/wishlist", authMiddleware, CartController.getUserWishlist);

module.exports = router;
