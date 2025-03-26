const Cart = require("../models/Cart");
const User = require("../models/User");

class CartService {
  // Add item to cart
  async addToCart(userId, productId, quantity = 1) {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    return cart;
  }

  // Remove item from cart
  async removeFromCart(userId, productId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    return cart;
  }

  // Get user's cart
  async getUserCart(userId) {
    return Cart.findOne({ userId }).populate("items.productId");
  }

  // Add item to wishlist
  async addToWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    return user.wishlist;
  }

  // Remove item from wishlist
  async removeFromWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    return user.wishlist;
  }

  // Get user's wishlist
  async getUserWishlist(userId) {
    return User.findById(userId).populate("wishlist");
  }
}

module.exports = new CartService();
