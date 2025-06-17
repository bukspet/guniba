const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware"); // assuming you have this for req.user

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

module.exports = router;
