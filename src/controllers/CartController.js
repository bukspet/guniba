const {
  removeCartItem,
  addToCart,
  getCartByUser,
  updateQuantity,
} = require("../services/CartService");

const getCartController = async (req, res) => {
  try {
    const cart = await getCartByUser(req.user.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addToCartController = async (req, res) => {
  try {
    const {
      variantId,
      productId,
      quantity,
      price,
      shippingCost = 0,
    } = req.body;

    console.log("Incoming body:", req.body);

    // ✅ Basic validation
    if (!variantId || !productId || !quantity || !price) {
      return res.status(400).json({
        message: "variantId, productId, quantity, and price are required",
      });
    }

    // ✅ Call the service
    const cart = await addToCart(req.user.id, {
      variantId,
      productId,
      quantity,
      price,
      shippingCost,
    });

    return res.status(200).json({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

const updateQuantityController = async (req, res) => {
  const { variantId } = req.params;
  const { action } = req.body;

  try {
    const cart = await updateQuantity(req.user.id, variantId, action);
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const removeItemController = async (req, res) => {
  const { variantId } = req.params;

  try {
    const cart = await removeCartItem(req.user.id, variantId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCartController,
  addToCartController,
  removeItemController,
  updateQuantityController,
};
