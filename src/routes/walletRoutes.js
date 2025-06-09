const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");

// GET wallet and transactions
router.get("/user/:userId", walletController.getWallet);

// PUT approve transaction
router.put(
  "/transaction/:transactionId/approve",
  walletController.approveTransaction
);

module.exports = router;
