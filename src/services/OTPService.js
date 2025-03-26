const OTP = require("../models/OTP.js");
const User = require("../models/User.js");
const { sendEmail, sendSMS } = require("../utils/NotificationUtils");

class OTPService {
  async sendOTP(userId, withdrawalId) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({ userId, withdrawalId, otpCode });

    const user = await User.findById(userId);
    const message = `Your withdrawal OTP is: ${otpCode}`;

    if (user.email)
      await sendEmail(user.email, "Wallet Withdrawal OTP", message);
    if (user.phone) await sendSMS(user.phone, message);
  }

  async verifyOTP(userId, withdrawalId, otpCode) {
    const otp = await OTP.findOne({ userId, withdrawalId, otpCode });
    if (!otp) throw new Error("Invalid OTP");

    await OTP.deleteOne({ _id: otp._id });
  }
}

module.exports = new OTPService();
