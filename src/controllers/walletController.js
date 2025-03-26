const WalletService = require("../services/walletService.js");
const OTPService = require("../services/OTPService");

class WalletController {
  static async requestWithdrawal(req, res) {
    try {
      const { userId } = req.user;
      const withdrawal = await WalletService.requestWithdrawal(userId);
      await OTPService.sendOTP(userId, withdrawal._id);
      res
        .status(200)
        .json({ message: "OTP sent, enter OTP to confirm withdrawal" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async confirmWithdrawal(req, res) {
    try {
      const { userId } = req.user;
      const { otp, withdrawalId } = req.body;
      await OTPService.verifyOTP(userId, withdrawalId, otp);
      await WalletService.confirmWithdrawal(userId, withdrawalId);
      res.status(200).json({ message: "Withdrawal processing" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async approveWithdrawal(req, res) {
    try {
      const { withdrawalId } = req.params;
      await WalletService.approveWithdrawal(withdrawalId);
      res.status(200).json({ message: "Withdrawal approved and paid" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = WalletController;
