const mongoose = require("mongoose");

const WithdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed"],
    default: "pending",
  },
});

module.exports = mongoose.model("Withdrawal", WithdrawalSchema);
