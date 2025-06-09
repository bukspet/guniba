const mongoose = require("mongoose");
const PayoutCardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accountName: String,
    accountNumber: String,
    bank: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayoutCard", PayoutCardSchema);
