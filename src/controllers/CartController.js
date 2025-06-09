const cartService = require("../services/cartService");

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCartByUser(req.user.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const cart = await cartService.addToCart(req.user.id, req.body);
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateQuantity = async (req, res) => {
  const { variantId } = req.params;
  const { action } = req.body;

  try {
    const cart = await cartService.updateQuantity(
      req.user.id,
      variantId,
      action
    );
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const removeItem = async (req, res) => {
  const { variantId } = req.params;

  try {
    const cart = await cartService.removeCartItem(req.user.id, variantId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeItem,
  updateQuantity,
};
