const Payment = require("../models/Payment");
const User = require("../models/User");
const Order = require("../models/Order");
const redisClient = require("../config/redis"); // assuming you have a Redis config
const { createOrder } = require("./orderService");
const { verifyPaystackPayment } = require("../utils/paystackHelper");
const mongoose = require("mongoose");

const generateReference = () =>
  "PM" + Math.floor(1000000000 + Math.random() * 9000000000);

exports.initiateWalletPayment = async (userId, items) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const totalPrice =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1;

  if (user.wallet < totalPrice) throw new Error("Insufficient wallet balance");

  user.wallet -= totalPrice;
  await user.save();

  const reference = generateReference();

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

  const order = await createOrder(
    payment.user,
    items.map((item) => ({
      variantId: item.variantId,
      price: item.price,
      quantity: item.quantity,
    })),
    payment.amount,
    payment.method
  );

  payment.order = order._id;
  await payment.save();

  return { message: "Payment successful via wallet", payment, order };
};

exports.initiatePaystackPayment = async (userId, items) => {
  const totalPrice =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1;

  const reference = generateReference();

  const payment = await Payment.create({
    user: userId,
    amount: Number(totalPrice.toFixed(2)), // Save as number
    method: "paystack",
    status: "pending",
    reference,
    items: items.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
    })),
  });

  return { reference, amount: totalPrice, payment };
};

exports.verifyAndCompletePaystackPayment = async (reference) => {
  const payment = await Payment.findOne({ reference });
  if (!payment) throw new Error("Payment not found");

  if (payment.status !== "pending") return payment;

  const verified = await verifyPaystackPayment(reference);

  if (verified.status !== "success") {
    payment.status = "failed";
    await payment.save();
    throw new Error("Payment verification failed");
  }

  const items = payment.items.map((item) => ({
    variantId: new mongoose.Types.ObjectId(item.id),
    quantity: item.quantity,
    price: item.price,
  }));

  const order = await createOrder(
    payment.user,
    items,
    payment.amount,
    payment.method
  );

  payment.order = order._id;
  payment.status = "successful";

  await payment.save();

  // console.time("redis.setEx");
  // await redisClient.setEx(
  //   `payment:${reference}`,
  //   3600,
  //   JSON.stringify({ status: "successful", orderId: order._id })
  // );

  return { message: "Payment successful via Paystack", payment, order };
};
