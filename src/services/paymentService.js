const Payment = require("../models/Payment");
const User = require("../models/User");
const Order = require("../models/Order");
const redisClient = require("../config/redis"); // assuming you have a Redis config
const { createOrder } = require("./orderService");
const {
  verifyPaystackPayment,
  getSeerbitToken,
  verifySeerbitPayment,
} = require("../utils/paystackHelper");
const mongoose = require("mongoose");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { createInvoice, confirmInvoice } = require("../utils/ligdicashHelper");

require("dotenv").config();
const generateReference = () =>
  "PM" + Math.floor(1000000000 + Math.random() * 9000000000);
const SEERBIT_PUBLIC_KEY = process.env.SEERBIT_PUBLIC_KEY;
const SEERBIT_SECRET_KEY = process.env.SEERBIT_SECRET_KEY;

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

// exports.initiateCinetpayPayment = async (userId, items, shippingAddress) => {
//   const API_KEY = process.env.CINETPAY_API_KEY;
//   const SITE_ID = process.env.CINETPAY_SITE_ID;

//   if (!API_KEY || !SITE_ID) {
//     console.error("CinetPay API_KEY or SITE_ID is missing");
//     throw new Error("Payment gateway configuration missing.");
//   }

//   if (!Array.isArray(items) || items.length === 0) {
//     throw new Error("Items are required and must be a non-empty array");
//   }

//   if (
//     !shippingAddress ||
//     typeof shippingAddress !== "object" ||
//     Array.isArray(shippingAddress)
//   ) {
//     throw new Error("Shipping address is required and must be an object");
//   }

//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");

//   const totalAmount = items.reduce((sum, item) => {
//     const price = parseFloat(item.price || 0);
//     const quantity = parseInt(item.quantity || 1);
//     return sum + price * quantity;
//   }, 0);

//   const totalPrice = Math.round(totalAmount * 1.1); // 10% extra
//   const reference = generateReference();

//   // ✅ Create payment with normalized items
//   const payment = await Payment.create({
//     user: userId,
//     amount: totalPrice,
//     method: "cinetpay",
//     status: "pending",
//     reference,
//     shippingAddress,
//     items: items.map((item) => ({
//       id: item.variant, // ✅ Save under 'id' (refers to Variant in schema)
//       price: parseFloat(item.price),
//       quantity: parseInt(item.quantity),
//     })),
//   });

//   const firstName = user.name?.split(" ")[0] || "Customer";
//   const lastName = user.name?.split(" ")[1] || "User";
//   const email = user.email || "noemail@example.com";
//   const phone = user.phone?.replace(/\D/g, "") || "0000000000";

//   const notifyUrl = `${process.env.API_BASE_URL}/api/payment/cinetpay/notify`;
//   const returnUrl = `${process.env.CLIENT_URL}/payment-verify`;

//   const payload = {
//     apikey: API_KEY,
//     site_id: SITE_ID,
//     transaction_id: reference,
//     amount: totalPrice,
//     currency: "XOF",
//     description: "Order payment",
//     notify_url: notifyUrl,
//     return_url: returnUrl,
//     customer_name: firstName,
//     customer_surname: lastName,
//     customer_email: email,
//     customer_phone_number: phone,
//     lang: "en",
//     channels: "ALL",
//   };

//   console.log("🚀 CinetPay Payload:", payload);

//   try {
//     const response = await axios.post(
//       "https://api-checkout.cinetpay.com/v2/payment",
//       payload,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     const data = response.data;

//     if (!data || data.code !== "201") {
//       console.error("CinetPay error response:", data);
//       throw new Error(
//         `CinetPay Error: ${data.message || "Unknown error"} (code: ${
//           data.code
//         })`
//       );
//     }

//     return {
//       redirect_url: data.data.payment_url,
//       reference,
//       amount: totalPrice,
//       message: "Payment initialized. Complete payment on CinetPay.",
//     };
//   } catch (error) {
//     console.error("CinetPay API Error:", error.response?.data || error.message);
//     throw new Error("Failed to initiate payment with CinetPay.");
//   }
// };

// exports.initiateSeerbitPayment = async (
//   userId,
//   items,
//   shippingAddress,
//   userEmail,
//   userName
// ) => {
//   if (!items || items.length === 0) throw new Error("Items are required");
//   if (!shippingAddress) throw new Error("Shipping address is required");

//   const totalPrice =
//     items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1;
//   const amount = Number(totalPrice.toFixed(2));
//   const reference = generateReference();

//   // Save payment record
//   const payment = await Payment.create({
//     user: userId,
//     amount,
//     method: "seerbit",
//     status: "pending",
//     reference,
//     shippingAddress,
//     items: items.map((item) => ({
//       id: item.variantId || item.id,
//       price: item.price,
//       quantity: item.quantity,
//     })),
//   });

//   // 🔐 Step 1: Get Encrypted Key
//   let encryptedKey;
//   try {
//     const encryptionRes = await axios.post(
//       "https://seerbitapi.com/api/v2/encrypt/keys",
//       {
//         key: `${SEERBIT_SECRET_KEY}.${SEERBIT_PUBLIC_KEY}`,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     encryptedKey = encryptionRes.data?.data?.EncryptedSecKey?.encryptedKey;

//     if (!encryptedKey) {
//       throw new Error("Encrypted key not returned from SeerBit.");
//     }
//   } catch (err) {
//     const message =
//       err.response?.data?.message ||
//       err.response?.data?.error ||
//       err.message ||
//       "Unknown error occurred while encrypting key";
//     throw new Error("SeerBit Token Error: " + message);
//   }

//   // 💳 Step 2: Initiate Payment with customization
//   const payload = {
//     publicKey: SEERBIT_PUBLIC_KEY,
//     amount: amount.toString(),
//     currency: "NGN",
//     country: "NG",
//     paymentReference: reference,
//     email: userEmail || "user@example.com",
//     fullName: userName || "John Doe",
//     redirectUrl: "https://guniba-client.vercel.app/payment/confirmation",
//     tokenize: "false",
//     callbackUrl: "https://guniba-client.vercel.app/api/payments/seerbit/verify",
//     customization: {
//       payment_method: ["card", "ussd", "account", "transfer"], // ✅ Active payment options
//       confetti: true,
//       theme: {
//         border_color: "000000",
//         background_color: "ffffff",
//         button_color: "000000",
//       },
//       logo: "https://guniba-client.vercel.app/logo.png", // replace with your logo URL
//     },
//   };

//   try {
//     const res = await axios.post(
//       "https://seerbitapi.com/api/v2/payments",
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${encryptedKey}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const checkoutLink = res.data?.data?.payments?.redirectLink;
//     if (!checkoutLink) {
//       throw new Error("Redirect link not found in SeerBit response.");
//     }

//     return {
//       reference,
//       amount,
//       paymentId: payment._id,
//       checkoutLink,
//       message: "Payment initialized. Complete payment via SeerBit.",
//     };
//   } catch (err) {
//     const message =
//       err?.response?.data?.message ||
//       err?.response?.data?.error ||
//       err.message ||
//       "Unknown error initiating payment";
//     throw new Error("Failed to initiate payment: " + message);
//   }
// };

// exports.verifyAndCompleteSeerbitPayment = async (reference) => {
//   const payment = await Payment.findOne({ reference });
//   if (!payment) throw new Error("Payment not found");

//   if (payment.status !== "pending") {
//     return { message: "Payment already processed", payment };
//   }

//   const result = await verifySeerbitPayment(reference);
//   if (result?.paymentStatus !== "SUCCESS") {
//     payment.status = "failed";
//     await payment.save();
//     throw new Error("Payment failed or not successful");
//   }

//   const items = payment.items.map((item) => ({
//     variantId: item.id,
//     quantity: item.quantity,
//     price: item.price,
//   }));

//   const order = await createOrder(
//     payment.user,
//     items,
//     payment.amount,
//     payment.method,
//     payment.shippingAddress
//   );

//   payment.status = "successful";
//   payment.order = order._id;
//   await payment.save();

//   return {
//     message: "Payment successful via Seerbit",
//     payment,
//     order,
//   };
// };
exports.initiateLigdicashPayment = async (
  userId,
  items,
  shippingAddress,
  userMeta = {}
) => {
  if (!items?.length) throw new Error("Items are required");
  if (!shippingAddress) throw new Error("Shipping address is required");

  // Compute totals
  const subtotal = items.reduce(
    (s, i) => s + Number(i.price) * Number(i.quantity),
    0
  );
  const totalWithTax = Math.round(subtotal * 1.1);

  const reference = generateReference("LDG");

  // Save initial payment row
  const payment = await Payment.create({
    user: userId,
    amount: totalWithTax,
    method: "ligdicash",
    status: "pending",
    reference, // internal ref
    shippingAddress,
    items: items.map((i) => ({
      id: i.variantId || i.id,
      price: i.price,
      quantity: i.quantity,
    })),
  });

  // Build Ligdicash invoice payload
  const payload = {
    commande: {
      invoice: {
        items: items.map((i) => ({
          name: i.name || "Item",
          description: i.description || "",
          quantity: Number(i.quantity),
          unit_price: Number(i.price),
          total_price: Number(i.price) * Number(i.quantity),
        })),
        total_amount: totalWithTax,
        devise: "XOF",
        description: userMeta.description || "Order payment",
        customer: userMeta.customer || "",
        customer_firstname: userMeta.firstName || "",
        customer_lastname: userMeta.lastName || "",
        customer_email: userMeta.email || "",
        external_id: reference,
        otp: "",
      },
      store: {
        name: process.env.STORE_NAME || "Guniba",
        website_url: process.env.STORE_URL || "https://www.guniba.net",
      },
      actions: {
        cancel_url:
          process.env.CANCEL_URL ||
          "https://www.guniba.net/checkout/ligdicash/cancel",
        return_url:
          process.env.RETURN_URL ||
          "https://www.guniba.net/checkout/ligdicash/return",
        callback_url:
          process.env.CALLBACK_URL ||
          "https://guniba.onrender.com/api/payment/ligdicash/",
      },
      custom_data: {
        order_id: reference,
        transaction_id: reference,
      },
    },
  };

  // Create invoice in Ligdicash
  const resp = await createInvoice(payload);
  console.log("resp", resp);

  const paymentUrl = resp?.response_text;
  const ligdiToken = resp?.token || null;

  if (!paymentUrl) {
    payment.status = "failed";
    await payment.save();
    throw new Error("Ligdicash did not return a payment URL");
  }

  // Save token for later confirmation
  if (ligdiToken) {
    payment.gatewayReference = ligdiToken;
    await payment.save();
  }

  return {
    reference,
    amount: totalWithTax,
    paymentId: payment._id,
    paymentUrl,
    ligdiToken, // return token for frontend if needed
    message: "Ligdicash invoice created.",
  };
};

/**
 * Verify + complete
 */
exports.verifyAndCompleteLigdicashPayment = async (tokenOrRef) => {
  // Find payment by token or reference
  const payment = await Payment.findOne({
    $or: [{ gatewayReference: tokenOrRef }, { reference: tokenOrRef }],
  });

  if (!payment) throw new Error("Payment not found");

  // ✅ Idempotency check
  if (payment.status === "successful") {
    console.log(
      `ℹ️ Payment ${payment.reference} already successful. Skipping verification.`
    );
    return { payment };
  }

  if (payment.status === "failed") {
    console.log(
      `ℹ️ Payment ${payment.reference} already failed. Skipping verification.`
    );
    return { payment };
  }

  // Only verify if still pending
  try {
    console.log(`🔍 Confirming invoice for token/ref: ${tokenOrRef}`);
    const ligdiResp = await confirmInvoice(
      payment.gatewayReference || tokenOrRef
    );

    const { response_code, status } = ligdiResp;

    if (response_code === "00" && status === "completed") {
      const order = await createOrder(
        payment.user,
        items,
        payment.amount,
        payment.method,
        payment.shippingAddress
      );
      payment.order = order._id;
      payment.status = "successful";
    } else if (status === "pending") {
      payment.status = "pending";
    } else {
      payment.status = "failed";
    }

    await payment.save();
    console.log(
      `✅ Payment ${payment.reference} updated to ${payment.status}.`
    );

    return { payment };
  } catch (err) {
    console.error("❌ verifyAndCompleteLigdicashPayment error:", err.message);
    throw err;
  }
};
