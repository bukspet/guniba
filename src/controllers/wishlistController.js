const wishlistService = require("../services/wishlistService");

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const wishlist = await wishlistService.addToWishlist(userId, productId);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await wishlistService.removeFromWishlist(
      userId,
      productId
    );
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMultipleFromWishlist = async (req, res) => {
  try {
    const { productIds } = req.body; // array of product IDs
    const userId = req.user.id;

    const wishlist = await wishlistService.removeMultipleFromWishlist(
      userId,
      productIds
    );
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await wishlistService.getWishlist(userId);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
