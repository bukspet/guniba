const mongoose = require("mongoose");

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    payoutCard: { type: mongoose.Schema.Types.ObjectId, ref: "PayoutCard" },
    reasonForRejection: {
      type: String,
    },
    actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    source: {
      type: String,
      enum: ["wallet", "commission"],
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
