const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  withdrawalId: { type: mongoose.Schema.Types.ObjectId, ref: "Withdrawal" },
  otpCode: { type: String, required: true },
});

module.exports = mongoose.model("OTP", OTPSchema);
