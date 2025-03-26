const CartService = require("../services/CartService");

class CartController {
  async addToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id; // Assuming user is authenticated

      const cart = await CartService.addToCart(userId, productId, quantity);
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeFromCart(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const cart = await CartService.removeFromCart(userId, productId);
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await CartService.getUserCart(userId);
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addToWishlist(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      const wishlist = await CartService.addToWishlist(userId, productId);
      res.status(200).json({ success: true, wishlist });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeFromWishlist(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const wishlist = await CartService.removeFromWishlist(userId, productId);
      res.status(200).json({ success: true, wishlist });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserWishlist(req, res) {
    try {
      const userId = req.user.id;
      const wishlist = await CartService.getUserWishlist(userId);
      res.status(200).json({ success: true, wishlist });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CartController();
