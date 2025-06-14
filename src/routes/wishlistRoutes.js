const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", wishlistController.getWishlistContoller);
router.post("/", wishlistController.addToWishlistController);
router.delete("/:productId", wishlistController.removeFromWishlistController);
router.post(
  "/remove-multiple",
  wishlistController.removeMultipleFromWishlistController
);

module.exports = router;
