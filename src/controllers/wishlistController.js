const {
  addToWishlist,
  removeFromWishlist,
  removeMultipleFromWishlist,
  getWishlist,
} = require("../services/wishlistService");

exports.addToWishlistController = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const wishlist = await addToWishlist(userId, productId);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromWishlistController = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await removeFromWishlist(userId, productId);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMultipleFromWishlistController = async (req, res) => {
  try {
    const { productIds } = req.body; // array of product IDs
    const userId = req.user.id;

    const wishlist = await removeMultipleFromWishlist(userId, productIds);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWishlistContoller = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await getWishlist(userId);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
