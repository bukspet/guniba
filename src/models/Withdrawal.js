const mongoose = require("mongoose");

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    payoutCard: { type: mongoose.Schema.Types.ObjectId, ref: "PayoutCard" },

    withdrawalType: {
      type: String,
      enum: ["wallet", "bank"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);
