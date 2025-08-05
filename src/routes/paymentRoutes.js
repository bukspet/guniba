const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");
// Make wallet payment
router.post("/wallet", authMiddleware, paymentController.walletPayment);

// Create Paystack payment link
router.post(
  "/paystack",
  authMiddleware,
  paymentController.createPaystackPayment
);

// Verify Paystack payment (after callback)
router.get("/verify", paymentController.verifyPaystack);

router.post(
  "/cinetpay",
  authMiddleware,
  paymentController.createCinetpayPayment
);

// Verify CinetPay payment
router.get("/cinetpay/verify", paymentController.verifyCinetpay);
router.post("/seerbit", authMiddleware, paymentController.createSeerbitPayment);
router.get("/seerbit/verify", paymentController.verifySeerbit);

module.exports = router;
