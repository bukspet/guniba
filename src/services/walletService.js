const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const User = require("../models/User");

// Get wallet & transactions
exports.getUserWallet = async (userId) => {
  const wallet = await Wallet.findOne({ user: userId });
  const transactions = await WalletTransaction.find({ user: userId }).sort({
    date: -1,
  });
  return { wallet, transactions };
};

// Approve transaction and credit wallet to user
exports.approveWalletTransaction = async (transactionId) => {
  const transaction = await WalletTransaction.findById(transactionId).populate(
    "user wallet"
  );
  if (!transaction) throw new Error("Transaction not found");
  if (transaction.status !== "pending")
    throw new Error("Transaction already processed");

  // Update transaction status
  transaction.status = "approved";
  await transaction.save();

  // Update wallet
  const wallet = transaction.wallet;
  wallet.balance += transaction.amount;
  wallet.totalEarnings += transaction.amount;
  await wallet.save();

  // Update user's wallet field for backwards compatibility
  const user = transaction.user;
  user.walletId = wallet._id;
  await user.save();

  return transaction;
};
