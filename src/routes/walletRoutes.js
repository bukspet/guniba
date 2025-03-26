const express = require("express");
const WalletController = require("../controllers/walletController.js");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const router = express.Router();

// Request Withdrawal (Send OTP)
router.post("/withdraw", authMiddleware, WalletController.requestWithdrawal);

// Confirm Withdrawal with OTP
router.post(
  "/withdraw/confirm",
  authMiddleware,
  WalletController.confirmWithdrawal
);

// Admin Approves Withdrawal
router.post(
  "/withdraw/approve/:withdrawalId",
  authMiddleware,
  adminMiddleware,
  WalletController.approveWithdrawal
);

module.exports = router;

// const express = require("express");
// const WalletService = require("../services/walletService.js");
// const OTPService = require("../services/OTPService");
// const NotificationService = require("../services/notificationService.js");
// const router = express.Router();
// const authMiddleware = require("../middlewares/authMiddleware");

// // Request Withdrawal (Send OTP)
// router.post("/withdraw", authMiddleware, async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const withdrawal = await WalletService.requestWithdrawal(userId);
//     await OTPService.sendOTP(userId, withdrawal._id);
//     res
//       .status(200)
//       .json({ message: "OTP sent, enter OTP to confirm withdrawal" });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Confirm Withdrawal with OTP
// router.post("/withdraw/confirm", authMiddleware, async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { otp, withdrawalId } = req.body;
//     await OTPService.verifyOTP(userId, withdrawalId, otp);
//     await WalletService.confirmWithdrawal(userId, withdrawalId);
//     res.status(200).json({ message: "Withdrawal processing" });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Admin Approves Withdrawal
// router.post(
//   "/withdraw/approve/:withdrawalId",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const { withdrawalId } = req.params;
//       await WalletService.approveWithdrawal(withdrawalId);
//       res.status(200).json({ message: "Withdrawal approved and paid" });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }
// );

// module.exports = router;
