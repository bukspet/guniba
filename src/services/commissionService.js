const Commission = require("../models/Commission");
const User = require("../models/User");
const notificationService = require("./notificationService");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const PayoutCard = require("../models/PayoutCard");
const WalletTransaction = require("../models/WalletTransaction");

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
  const user = await User.findById(userId);
  const totalCommission = await this.getUserCommissionSummary(userId);

  if (amount > totalCommission)
    throw new Error("Insufficient commission balance");
  user.commissionBalance -= amount;
  user.wallet += amount;
  // const withdrawal = await WithdrawalRequest.create({
  //   reference: generateReference(),
  //   user: userId,
  //   amount,
  //   source: "commission",
  //   withdrawalType: "wallet",
  //   status: "pending", // processed later in admin flow
  // });

  await WalletTransaction.create({
    user: userId,
    transactionId: generateTransactionId(),
    type: "withdrawal to Wallet",
    amount,
    status: "approved",
  });

  return {
    message: "Withdrawal to wallet requested",
    withdrawal,
  };
};

exports.withdrawToBank = async (userId, amount, payoutCardId) => {
  const totalCommission = await this.getUserCommissionSummary(userId);
  if (amount > totalCommission)
    throw new Error("Insufficient commission balance");

  const card = await PayoutCard.findOne({ _id: payoutCardId, user: userId });
  if (!card) throw new Error("Invalid payout card");

  const withdrawal = await WithdrawalRequest.create({
    reference: generateReference(),
    user: userId,
    amount,
    source: "commission",
    payoutCard: payoutCardId,
    withdrawalType: "bank",
    status: "pending",
  });

  await WalletTransaction.create({
    user: userId,
    transactionId: generateTransactionId(),
    type: "withdrawal to Bank",
    amount,
    status: "pending",
  });

  await notificationService.createNotification(
    {
      userId,
      title: "New Withdrawal Request",
      message: "A new withdrawal Request was placed.",
      type: "request",
      forAdmin: true,
    },
    sendRealTimeNotification
  );

  return {
    message: "Withdrawal request to bank created",
    withdrawal,
  };
};
