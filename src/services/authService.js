const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateReferralCode } = require("../utils/referralUtils.js");

const sendRealTimeNotification = (userId, notification) => {
  console.log(
    `Real-time notification sent to ${userId}: ${notification.message}`
  );
};
const NotificationService = require("../services/notificationService.js")(
  sendRealTimeNotification
);
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
class AuthService {
  static async signup({ fullName, email, password, referralCode }) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { success: false, message: "Email already in use", data: null };
      }

      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (!referrer) {
          return {
            success: false,
            message: "Invalid referral code",
            data: null,
          };
        }
        referredBy = referrer._id;
      }

      const newReferralCode = generateReferralCode();

      const newUser = await User.create({
        fullName,
        email,
        password,
        referralCode: newReferralCode,
        referredBy,
      });

      // Send Welcome Notification (Non-blocking)
      NotificationService.sendNotification(
        newUser._id,
        "Welcome!",
        `Hello ${newUser.fullName}, welcome to Guniba!`
      ).catch((err) => console.error("Notification Error:", err.message));

      const token = generateToken(newUser._id);

      return {
        success: true,
        message: "Signup successful",
        data: { id: newUser._id, email: newUser.email, token },
      };
    } catch (error) {
      return {
        success: false,
        message: `Signup Error: ${error.message}`,
        data: null,
      };
    }
  }
  static async signin({ email, password }) {
    try {
      const user = await User.findOne({ email });
      console.log("User Found:", user); // Debugging

      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
          data: null,
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("Password Match:", isPasswordValid); // Debugging

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid email or password",
          data: null,
        };
      }

      const token = generateToken(user._id);
      return {
        success: true,
        message: "Signin successful",
        data: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          referralCode: user.referralCode,
          token,
        },
      };
    } catch (error) {
      console.error("Signin Error:", error);
      return {
        success: false,
        message: `Signin Error: ${error.message}`,
        data: null,
      };
    }
  }

  static async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: "User not found.", data: null };
      }
      const resetCode = crypto.randomBytes(20).toString("hex");
      user.resetPasswordCode = resetCode;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
      //send code to email
      console.log("resetcode", resetCode);
      return { success: true, message: "Password reset link sent to email." };
    } catch (error) {
      return {
        success: false,
        message: `Password Reset Request Error: ${error.message}`,
      };
    }
  }
  static async verifyResetEmailRequest(code) {
    try {
      const user = await User.findOne({
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return { success: false, message: "Invalid or expired reset code." };
      }
      return {
        success: true,
        message: "Code verified. Proceed with password reset.",
      };
    } catch (error) {
      return {
        success: false,
        message: `Verification Error: ${error.message}`,
      };
    }
  }
  static async resetPassword(code, newPassword) {
    try {
      const user = await User.findOne({
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return { success: false, message: "Invalid or expired reset code." };
      }

      user.password = newPassword;
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await user.save();
      return { success: true, message: "Password reset successfully." };
    } catch (error) {
      return {
        success: false,
        message: `Password Reset Error: ${error.message}`,
      };
    }
  }
  static async verifyUser(code) {
    const user = await User.findOne({ verificationCode: code });

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired verification code.",
      };
    }

    user.verified = true;
    user.verificationCode = null;
    await user.save();

    return { success: true, message: "Email verified successfully!" };
  }
  static async resendVerification(email) {
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.verified) {
      return { success: false, message: "User is already verified." };
    }

    const newCode = crypto.randomBytes(20).toString("hex");
    user.verificationCode = newCode;
    await user.save();
    console.log("newCode", newCode);
    // await sendVerificationEmail(email, newCode);

    return {
      success: true,
      message: "Verification email resent successfully.",
    };
  }
}
module.exports = AuthService;
