const Wishlist = require("../models/Wishlist");

const addToWishlist = async (userId, productId) => {
  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [productId] });
  } else {
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
  }

  return wishlist;
};

const removeFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { products: productId } },
    { new: true }
  );
  return wishlist;
};

const removeMultipleFromWishlist = async (userId, productIds) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { products: { $in: productIds } } },
    { new: true }
  );
  return wishlist;
};

const getWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ userId }).populate("products");
  return wishlist || { userId, products: [] };
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  removeMultipleFromWishlist,
  getWishlist,
};
