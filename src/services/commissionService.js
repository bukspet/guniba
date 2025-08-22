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
  console.log(userId, total, "d");
  return total;
};

exports.withdrawToWallet = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Check available balance
  if (amount > user.commissionBalance) {
    throw new Error("Insufficient commission balance");
  }

  // Deduct commission and increase wallet
  user.commissionBalance -= amount;
  user.wallet += amount;
  await user.save();

  // Log transaction
  const withdrawal = await WalletTransaction.create({
    user: userId,
    transactionId: generateReference(),
    type: "withdrawal to Wallet",
    amount,
    status: "approved",
  });

  return {
    message: "Withdrawal to wallet successful",
    withdrawal,
  };
};

exports.withdrawToBank = async (userId, amount, payoutCardId) => {
  // Step 1: Check commission balance
  const user = await User.findById(userId);
  const totalCommission = await exports.getUserCommissionSummary(userId);
  if (amount > user.commissionBalance) {
    throw new Error("Insufficient commission balance");
  }

  // Step 2: Validate payout card
  const card = await PayoutCard.findOne({ _id: payoutCardId, user: userId });
  if (!card) {
    throw new Error("Invalid payout card");
  }

  // Generate a single reference for consistency
  const reference = generateReference();

  // Step 3: Create withdrawal + wallet transaction (atomic if using mongoose transaction)

  const withdrawal = await WithdrawalRequest.create({
    requestId: reference,
    user: userId,
    amount,
    source: "commission",
    payoutCard: payoutCardId,
    status: "pending",
  });

  await WalletTransaction.create({
    user: userId,
    transactionId: reference,
    type: "withdrawal to Bank",
    amount,
    status: "pending",
  });

  // Step 4: Notify admin
  await notificationService.createNotification({
    userId,
    title: "New Withdrawal Request",
    message: "A new withdrawal request was placed.",
    type: "request",
    forAdmin: true,
  });

  // Final return
  return {
    success: true,
    message: "Withdrawal request to bank created successfully",
    withdrawal,
  };
};
