const Payment = require("../models/Payment");
const User = require("../models/User");
const Order = require("../models/Order");
const redisClient = require("../config/redis"); // assuming you have a Redis config
const { createOrder } = require("./orderService");
const { verifyPaystackPayment } = require("../utils/paystackHelper");
const mongoose = require("mongoose");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const generateReference = () =>
  "PM" + Math.floor(1000000000 + Math.random() * 9000000000);

exports.initiateWalletPayment = async (userId, items, shippingAddress) => {
  // ✅ Validate user
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

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
    shippingAddress,
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
    variantId: new mongoose.Types.ObjectId(
      typeof item.variantId === "object" ? item.variantId._id : item.variantId
    ),
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

exports.initiateCinetpayPayment = async (userId, items, shippingAddress) => {
  const API_KEY = process.env.CINETPAY_API_KEY;
  const SITE_ID = process.env.CINETPAY_SITE_ID;

  if (!API_KEY || !SITE_ID) {
    console.error("CinetPay API_KEY or SITE_ID is missing");
    throw new Error("Payment gateway configuration missing.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items are required and must be a non-empty array");
  }

  if (
    !shippingAddress ||
    typeof shippingAddress !== "object" ||
    Array.isArray(shippingAddress)
  ) {
    throw new Error("Shipping address is required and must be an object");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const totalAmount = items.reduce((sum, item) => {
    const price = parseFloat(item.price || 0);
    const quantity = parseInt(item.quantity || 1);
    return sum + price * quantity;
  }, 0);

  const totalPrice = Math.round(totalAmount * 1.1); // 10% extra
  const reference = generateReference();

  // ✅ Create payment with normalized items
  const payment = await Payment.create({
    user: userId,
    amount: totalPrice,
    method: "cinetpay",
    status: "pending",
    reference,
    shippingAddress,
    items: items.map((item) => ({
      id: item.variant, // ✅ Save under 'id' (refers to Variant in schema)
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity),
    })),
  });

  console.log("💾 Payment created:", reference);

  const firstName = user.name?.split(" ")[0] || "Customer";
  const lastName = user.name?.split(" ")[1] || "User";
  const email = user.email || "noemail@example.com";
  const phone = user.phone?.replace(/\D/g, "") || "0000000000";

  const notifyUrl = `${process.env.API_BASE_URL}/api/payment/cinetpay/notify`;
  const returnUrl = `${process.env.CLIENT_URL}/payment-verify`;

  const payload = {
    apikey: API_KEY,
    site_id: SITE_ID,
    transaction_id: reference,
    amount: totalPrice,
    currency: "XOF",
    description: "Order payment",
    notify_url: notifyUrl,
    return_url: returnUrl,
    customer_name: firstName,
    customer_surname: lastName,
    customer_email: email,
    customer_phone_number: phone,
    lang: "en",
    channels: "ALL",
  };

  console.log("🚀 CinetPay Payload:", payload);

  try {
    const response = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data;

    if (!data || data.code !== "201") {
      console.error("CinetPay error response:", data);
      throw new Error(
        `CinetPay Error: ${data.message || "Unknown error"} (code: ${
          data.code
        })`
      );
    }

    return {
      redirect_url: data.data.payment_url,
      reference,
      amount: totalPrice,
      message: "Payment initialized. Complete payment on CinetPay.",
    };
  } catch (error) {
    console.error("CinetPay API Error:", error.response?.data || error.message);
    throw new Error("Failed to initiate payment with CinetPay.");
  }
};
