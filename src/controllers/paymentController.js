// controllers/paymentController.js
const ShippingAddress = require("../models/ShippingAddress");
const paymentService = require("../services/paymentService");

exports.walletPayment = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body; // ✅ include shippingAddress
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    const result = await paymentService.initiateWalletPayment(
      userId,
      items,
      shippingAddress
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Wallet payment error:", err);
    return res.status(400).json({ error: err.message });
  }
};

// ✅ Create Paystack Payment
exports.createPaystackPayment = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    const result = await paymentService.initiatePaystackPayment(
      req.user._id,
      items,
      shippingAddress
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Paystack Payment Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Verify Paystack Payment
exports.verifyPaystack = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: "Payment reference is required" });
    }

    const result = await paymentService.verifyAndCompletePaystackPayment(
      reference
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Verify Paystack Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.createLigdicashPayment = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    // Optionally pass user details for invoice
    const userMeta = {
      email: req.user?.email,
      firstName: req.user?.firstName || req.user?.name?.split(" ")?.[0],
      lastName:
        req.user?.lastName || req.user?.name?.split(" ")?.slice(1).join(" "),
    };

    const result = await paymentService.initiateLigdicashPayment(
      req.user._id,
      items,
      shippingAddress,
      userMeta
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Ligdicash Payment Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Verify Ligdicash Payment
exports.verifyLigdicash = async (req, res) => {
  try {
    const { ref } = req.query;
    if (!ref) {
      return res.status(400).json({ error: "Payment reference is required" });
    }

    const result = await paymentService.verifyAndCompleteLigdicashPayment(ref);

    return res.status(200).json(result);
  } catch (err) {
    console.error("Verify Ligdicash Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Webhook Callback from Ligdicash
exports.ligdicashCallback = async (req, res) => {
  try {
    const body = req.body;

    // Extract token (main transaction token)
    const token =
      body?.token ||
      body?.invoice?.token ||
      body?.external_id ||
      body?.commande?.invoice?.external_id;

    // Extract custom_data if it's an array
    let orderId = null;
    if (Array.isArray(body?.custom_data)) {
      const orderData = body.custom_data.find(
        (item) => item.keyof_customdata === "order_id"
      );
      if (orderData) orderId = orderData.valueof_customdata;
    }

    // Fallback if token is not found
    const transactionToken = token || orderId;

    if (!transactionToken) {
      console.warn("Ligdicash callback missing token/order_id:", body);
      return res.status(200).json({ received: true });
    }

    // Extract useful info for logging/debugging
    const { response_code, status, operator_name, transaction_id, montant } =
      body;

    console.log("✅ Ligdicash Callback Received:", {
      token: transactionToken,
      response_code,
      status,
      operator_name,
      transaction_id,
      montant,
    });

    // Process payment verification / completion
    await paymentService.verifyAndCompleteLigdicashPayment(transactionToken);

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Ligdicash Callback Error:", err);
    return res.status(200).json({ received: true }); // Always 200 to avoid repeated retries
  }
};

exports.createCinetpayPayment = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user._id;

    console.log("📦 Incoming items:", items);
    console.log("🏠 Shipping Address ID:", shippingAddress);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Items are required and must be a non-empty array",
      });
    }

    if (!shippingAddress || typeof shippingAddress !== "string") {
      return res.status(400).json({
        error: "Shipping address ID is required and must be a string",
      });
    }

    const fullAddress = await ShippingAddress.findById(shippingAddress);
    if (!fullAddress) {
      return res.status(404).json({ error: "Shipping address not found" });
    }

    // ✅ Normalize items: map variant field (required by backend and CinetPay)
    const normalizedItems = items.map((item, index) => {
      const variantId =
        item?.variant?._id || item?.variant?.id || item?.variant || item?.id;

      if (!variantId) {
        throw new Error(`Item at index ${index} is missing a valid 'variant'`);
      }
      if (typeof item.price !== "number" || item.price <= 0) {
        throw new Error(`Item at index ${index} has an invalid 'price'`);
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        throw new Error(`Item at index ${index} has an invalid 'quantity'`);
      }

      return {
        variant: variantId.toString(), // ✅ Send 'variant' instead of 'id'
        price: item.price,
        quantity: item.quantity,
      };
    });

    console.log("✅ Normalized Items (CinetPay):", normalizedItems);

    const result = await paymentService.initiateCinetpayPayment(
      userId,
      normalizedItems,
      fullAddress
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ CinetPay Payment Init Error:", err);
    return res.status(500).json({
      error: err.message || "Internal server error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

exports.verifyCinetpay = async (req, res) => {
  try {
    const { transaction_id } = req.query;

    console.log("🔍 CinetPay Verification Query Params:", req.query);

    if (!transaction_id) {
      console.warn("⚠️ Missing transaction_id in query");
      return res.status(400).json({ error: "Transaction ID is required" });
    }

    const result = await paymentService.verifyAndCompleteCinetpayPayment(
      transaction_id
    );

    console.log("✅ CinetPay Payment Verified:", result);

    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ CinetPay Verification Error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error: " + err.message });
  }
};
exports.createSeerbitPayment = async (req, res) => {
  console.log("hrkk", req.body);

  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    const result = await paymentService.initiateSeerbitPayment(
      req.user._id,
      items,
      shippingAddress,
      req.user.email,
      req.user.fullName
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Seerbit Payment Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.verifySeerbit = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: "Payment reference is required" });
    }

    const result = await paymentService.verifyAndCompleteSeerbitPayment(
      reference
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Verify Seerbit Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
