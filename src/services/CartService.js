const Cart = require("../models/Cart");
const mongoose = require("mongoose");
const getCartByUser = async (userId) => {
  return await Cart.findOne({ userId }).populate("items.variantId");
};

const addToCart = async (userId, { variantId, productId, quantity }) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [{ variantId, productId, quantity }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.variantId.toString() === variantId.toString()
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ variantId, productId, quantity });
    }

    await cart.save();
  }

  return cart;
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
