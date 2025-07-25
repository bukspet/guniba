const Cart = require("../models/Cart");
const mongoose = require("mongoose");
const { Product } = require("../models/Product");
const getCartByUser = async (userId) => {
  return await Cart.findOne({ userId }).populate("items.variantId");
};

const addToCart = async (
  userId,
  { variantId, productId, quantity, price, shippingCost = 0 }
) => {
  // Convert IDs to ObjectId for consistency
  const variantObjectId = new mongoose.Types.ObjectId(variantId);
  const productObjectId = new mongoose.Types.ObjectId(productId);

  let cart = await Cart.findOne({ userId });
  let message;

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [
        {
          variantId: variantObjectId,
          productId: productObjectId,
          quantity,
          price,
          shippingCost,
        },
      ],
    });
    message = "Item added to cart";
  } else {
    const existingItem = cart.items.find(
      (item) => item.variantId.toString() === variantObjectId.toString()
    );

    if (existingItem) {
      existingItem.quantity += quantity; // ✅ Increase quantity instead of adding duplicate
      message = "Item quantity updated";
    } else {
      cart.items.push({
        variantId: variantObjectId,
        productId: productObjectId,
        quantity,
        price,
        shippingCost,
      });
      message = "Item added to cart";
    }

    await cart.save();
  }

  return { cart, message };
};

const updateQuantity = async (userId, variantId, action) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find(
    (i) => i.variantId.toString() === variantId.toString()
  );

  if (!item) throw new Error("Item not found");

  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease") {
    item.quantity = Math.max(1, item.quantity - 1);
  }

  await cart.save();
  return cart;
};

const removeCartItem = async (userId, variantId) => {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { variantId: new mongoose.Types.ObjectId(variantId) } } },
    { new: true }
  );

  return cart;
};

module.exports = {
  removeCartItem,
  updateQuantity,
  addToCart,
  getCartByUser,
};
