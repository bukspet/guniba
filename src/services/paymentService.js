const Payment = require("../models/Payment");
const User = require("../models/User");
const Order = require("../models/Order");
const redisClient = require("../config/redis"); // assuming you have a Redis config
const { createOrder } = require("./orderService");
const { verifyPaystackPayment } = require("../utils/paystackHelper"); // helper to verify Paystack

const generateReference = () =>
  "PM" + Math.floor(1000000000 + Math.random() * 9000000000);

exports.initiateWalletPayment = async (userId, items) => {
  const user = await User.findById(userId);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (user.wallet < totalPrice) throw new Error("Insufficient wallet balance");

  // Deduct wallet
  user.wallet -= totalPrice;
  await user.save();

  const reference = generateReference();
  const payment = await Payment.create({
    user: userId,
    amount: totalPrice,
    method: "wallet",
    status: "successful",
    reference,
  });

  const order = await createOrder(userId, items);

  payment.order = order._id;
  await payment.save();

  await redisClient.setEx(
    `payment:${reference}`,
    3600,
    JSON.stringify({ status: "successful", orderId: order._id })
  );

  return { message: "Payment successful via wallet", payment, order };
};

exports.initiatePaystackPayment = async (userId, items) => {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const reference = generateReference();

  const payment = await Payment.create({
    user: userId,
    amount: totalPrice,
    method: "paystack",
    status: "pending",
    reference,
  });

  return { reference, amount: totalPrice, payment };
};

exports.verifyAndCompletePaystackPayment = async (reference) => {
  const payment = await Payment.findOne({ reference });
  if (!payment) throw new Error("Payment not found");

  if (payment.status !== "pending") return payment; // already processed

  const verified = await verifyPaystackPayment(reference);

  if (verified.status !== "success") {
    payment.status = "failed";
    await payment.save();
    throw new Error("Payment verification failed");
  }

  const order = await createOrder(payment.user, verified.items);
  payment.order = order._id;
  payment.status = "successful";
  await payment.save();

  await redisClient.setEx(
    `payment:${reference}`,
    3600,
    JSON.stringify({ status: "successful", orderId: order._id })
  );

  return { message: "Payment successful via Paystack", payment, order };
};
