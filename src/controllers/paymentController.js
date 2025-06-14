// controllers/paymentController.js
const paymentService = require("../services/paymentService");

exports.walletPayment = async (req, res) => {
  try {
    const { items } = req.body;
    const result = await paymentService.initiateWalletPayment(
      req.user._id,
      items
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createPaystackPayment = async (req, res) => {
  try {
    const { items } = req.body;
    const result = await paymentService.initiatePaystackPayment(
      req.user._id,
      items
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.verifyPaystack = async (req, res) => {
  try {
    const { reference } = req.query;
    const result = await paymentService.verifyAndCompletePaystackPayment(
      reference
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
