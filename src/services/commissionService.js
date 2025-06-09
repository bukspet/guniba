const Commission = require("../models/Commission");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const PayoutCard = require("../models/PayoutCard");

function generateReference() {
  return "#" + Math.floor(100000 + Math.random() * 900000); // e.g. #123456
}

exports.getUserCommissions = async (userId) => {
  return await Commission.find({ recipient: userId })
    .populate("fromUser", "name email")
    .populate("orderId", "orderNumber totalPrice");
};

exports.getUserCommissionSummary = async (userId) => {
  const commissions = await Commission.find({ recipient: userId });
  const total = commissions.reduce((sum, item) => sum + item.amount, 0);
  return total;
};

exports.withdrawToWallet = async (userId, amount) => {
  const totalCommission = await this.getUserCommissionSummary(userId);
  if (amount > totalCommission)
    throw new Error("Insufficient commission balance");

  // Log withdrawal request
  const withdrawal = await WithdrawalRequest.create({
    reference: generateReference(),
    user: userId,
    amount,
    source: "commission",
    status: "approved", // Direct wallet top-up
  });

  // Add to wallet
  //   const user = await User.findById(userId);
  //   user.wallet += amount;
  //   await user.save();

  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }

  await WalletTransaction.create({
    user: userId,
    wallet: wallet._id,
    transactionId: generateTransactionId(),
    type: "withdrawal",
    amount,
    status: "pending", // same as withdrawal status
  });

  return {
    message: "Withdrawal to wallet successful",
    withdrawal,
    newWalletBalance: user.wallet,
  };
};

exports.withdrawToBank = async (userId, amount, payoutCardId) => {
  const totalCommission = await this.getUserCommissionSummary(userId);
  if (amount > totalCommission)
    throw new Error("Insufficient commission balance");

  // Validate payout card
  const card = await PayoutCard.findOne({ _id: payoutCardId, user: userId });
  if (!card) throw new Error("Invalid payout card");

  // Create withdrawal request for admin to approve
  const withdrawal = await WithdrawalRequest.create({
    reference: generateReference(),
    user: userId,
    amount,
    source: "commission",
    payoutCard: payoutCardId,
    status: "pending",
  });

  return {
    message: "Withdrawal request to bank created",
    withdrawal,
  };
};
