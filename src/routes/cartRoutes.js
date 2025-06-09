// routes/cartRoutes.ts
const express = require("express");

const CartController = require("../controllers/cartController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", CartController.getCart);
router.post("/", CartController.addToCart);
router.patch("/:variantId", CartController.updateQuantity);
router.delete("/:variantId", CartController.removeItem);

module.exports = router;
