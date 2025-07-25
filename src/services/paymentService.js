const Payment = require("../models/Payment");
const User = require("../models/User");
const Order = require("../models/Order");
const redisClient = require("../config/redis"); // assuming you have a Redis config
const { createOrder } = require("./orderService");
const { verifyPaystackPayment } = require("../utils/paystackHelper");
const mongoose = require("mongoose");

const generateReference = () =>
  "PM" + Math.floor(1000000000 + Math.random() * 9000000000);

exports.initiateWalletPayment = async (userId, items, shippingAddress) => {
  // ✅ Validate user
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  console.log("User:", userId, "Items:", items, "Shipping:", shippingAddress);

  // ✅ Calculate total price with 10% tax
  const totalPrice =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1;

  if (user.wallet < totalPrice) throw new Error("Insufficient wallet balance");

  // ✅ Deduct wallet
  user.wallet -= totalPrice;
  await user.save();

  // ✅ Generate reference
  const reference = generateReference();

  // ✅ Create payment record
  const payment = await Payment.create({
    user: userId,
    amount: Number(totalPrice.toFixed(2)),
    method: "wallet",
    status: "successful",
    reference,
    items: items.map((item) => ({
      id: item.variantId,
      price: item.price,
      quantity: item.quantity,
    })),
  });

  // ✅ Create order and link to payment
  const order = await createOrder(
    userId,
    items.map((item) => ({
      variantId: item.variantId,
      price: item.price,
      quantity: item.quantity,
    })),
    payment.amount,
    payment.method,
    shippingAddress
  );

  payment.order = order._id;
  await payment.save();

  return {
    message: "Payment successful via wallet",
    payment,
    order,
  };
};

exports.initiatePaystackPayment = async (userId, items, shippingAddress) => {
  if (!items || items.length === 0) {
    throw new Error("Items are required");
  }
  console.log("User:", userId, "Items:", items, "Shipping:", shippingAddress);
  if (!shippingAddress) {
    throw new Error("Shipping address is required");
  }

  // ✅ Calculate total price with 10% tax
  const totalPrice =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1;

  const reference = generateReference();

  // ✅ Save initial payment record
  const payment = await Payment.create({
    user: userId,
    amount: Number(totalPrice.toFixed(2)),
    method: "paystack",
    status: "pending",
    reference,
    shippingAddress, // ✅ Save shipping address
    items: items.map((item) => ({
      id: item.variantId || item.id, // Ensure variantId consistency
      price: item.price,
      quantity: item.quantity,
    })),
  });
  console.log("Payment created:", payment);
  return {
    reference,
    amount: Number(totalPrice.toFixed(2)),
    paymentId: payment._id,
    message: "Payment initialized. Complete payment on Paystack.",
  };
};

exports.verifyAndCompletePaystackPayment = async (reference) => {
  const payment = await Payment.findOne({ reference });
  if (!payment) throw new Error("Payment not found");

  if (payment.status !== "pending") {
    return { message: "Payment already processed", payment };
  }

  // ✅ Verify Paystack transaction
  const verified = await verifyPaystackPayment(reference);

  if (verified.status !== "success") {
    payment.status = "failed";
    await payment.save();
    throw new Error("Payment verification failed");
  }

  // ✅ Prepare items for order creation
  const items = payment.items.map((item) => ({
    variantId: new mongoose.Types.ObjectId(item.id),
    quantity: item.quantity,
    price: item.price,
  }));

  // ✅ Create order
  const order = await createOrder(
    payment.user,
    items,
    payment.amount,
    payment.method,
    payment.shippingAddress // ✅ Use shippingAddress stored earlier
  );

  // ✅ Update payment record
  payment.order = order._id;
  payment.status = "successful";
  await payment.save();

  return {
    message: "Payment successful via Paystack",
    payment,
    order,
  };
};
