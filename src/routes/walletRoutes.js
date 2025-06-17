const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const authMiddleware = require("../middlewares/authMiddleware");
// GET wallet and transactions
router.get("/user/:userId", authMiddleware, walletController.getWallet);

// PUT approve transaction
// router.put(
//   "/transaction/:transactionId/approve",
//   walletController.approveTransaction
// );

module.exports = router;
