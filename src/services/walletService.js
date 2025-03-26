const Wallet = require("../models/Wallet.js");
const Withdrawal = require("../models/Withdrawal.js");
const NotificationService = require("./notificationService.js");

class WalletService {
  async requestWithdrawal(userId) {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance <= 0) throw new Error("Insufficient balance");

    const existingWithdrawal = await Withdrawal.findOne({
      userId,
      status: "processing",
    });
    if (existingWithdrawal) throw new Error("Withdrawal already in process");

    const withdrawal = await Withdrawal.create({
      userId,
      amount: wallet.balance,
      status: "pending",
    });

    return withdrawal;
  }

  async confirmWithdrawal(userId, withdrawalId) {
    const withdrawal = await Withdrawal.findOne({ _id: withdrawalId, userId });
    if (!withdrawal || withdrawal.status !== "pending")
      throw new Error("Invalid withdrawal request");

    withdrawal.status = "processing";
    await withdrawal.save();
  }

  async approveWithdrawal(withdrawalId) {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal || withdrawal.status !== "processing")
      throw new Error("Invalid withdrawal");

    withdrawal.status = "completed";
    await withdrawal.save();

    // Reset wallet balance to zero
    await Wallet.findOneAndUpdate(
      { userId: withdrawal.userId },
      { balance: 0 }
    );

    // Notify User
    await NotificationService.sendNotification(
      withdrawal.userId,
      "Wallet Withdrawal Paid",
      `Your withdrawal of $${withdrawal.amount} has been approved and paid.`
    );
  }
}

module.exports = new WalletService();
