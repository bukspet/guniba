const WalletTransaction = require("../models/WalletTransaction");
const User = require("../models/User");

// Get wallet & transactions
exports.getUserWallet = async (userId) => {
  const transactions = await WalletTransaction.find({ user: userId }).sort({
    date: -1,
  });
  return { transactions };
};
