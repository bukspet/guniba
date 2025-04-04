const Cart = require("../models/Cart");
const User = require("../models/User");

class CartService {
  async addToCart(userId, variantId, quantity = 1) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.variantId.toString() === variantId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ variantId, quantity });
    }

    await cart.save();
    return cart;
  }

  async removeFromCart(userId, variantId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(
      (item) => item.variantId.toString() !== variantId
    );
    await cart.save();
    return cart;
  }

  async getUserCart(userId) {
    return Cart.findOne({ userId }).populate("items.variantId");
  }

  async addToWishlist(userId, productId) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, wishlist: [] });
    }

    if (!cart.wishlist.includes(productId)) {
      cart.wishlist.push(productId);
      await cart.save();
    }

    return cart.wishlist;
  }

  async removeFromWishlist(userId, productId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Wishlist not found");

    cart.wishlist = cart.wishlist.filter((id) => id.toString() !== productId);
    await cart.save();
    return cart.wishlist;
  }

  async getUserWishlist(userId) {
    return Cart.findOne({ userId }).populate("wishlist");
  }
}

module.exports = new CartService();
