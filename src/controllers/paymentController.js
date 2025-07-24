// controllers/paymentController.js
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
