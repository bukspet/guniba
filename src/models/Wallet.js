const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  transactionId: { type: String, unique: true }, // e.g. RF1234567890
  type: {
    type: String,
    enum: ["withdrawal", "purchase"],
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
