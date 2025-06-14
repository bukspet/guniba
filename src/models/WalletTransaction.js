const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  transactionId: { type: String, unique: true }, // e.g. RF1234567890
  type: {
    type: String,
    enum: ["withdrawal to Wallet", "withdrawal to Bank", "purchase"],
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
