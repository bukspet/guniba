const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const parser = require("ua-parser-js");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateReferralCode } = require("../utils/referralUtils.js");
const {
  generateRandomSixDigitCode,
} = require("../utils/generateRandomSixDigitCode.js");
const {
  sendResetPasswordEmail,
} = require("../utils/emailservice/templates/sendResetPasswordEmail.js");

// const sendRealTimeNotification = (userId, notification) => {
//   console.log(
//     `Real-time notification sent to ${userId}: ${notification.message}`
//   );
// };
// const NotificationService = require("../services/notificationService.js")(
//   sendRealTimeNotification
// );
// const generateToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
// };

const generateTokens = (userId, role, type) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  let refreshToken = null;
  if (type === "both" || type === "refresh") {
    refreshToken = jwt.sign(
      { id: userId, role },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );
  }

  return { accessToken, refreshToken };
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
      // NotificationService.sendNotification(
      //   newUser._id,
      //   "Welcome!",
      //   `Hello ${newUser.fullName}, welcome to Guniba!`
      // ).catch((err) => console.error("Notification Error:", err.message));

      // const token = generateToken(newUser._id);

      const { accessToken, refreshToken } = generateTokens(
        newUser._id,
        newUser.role,
        "both"
      );

      return {
        success: true,
        message: "Signup successful",
        data: {
          id: newUser._id,
          email: newUser.email,
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Signup Error: ${error.message}`,
        data: null,
      };
    }
  }
  static async signin({ email, password, req }) {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress;

      const ua = parser(req.headers["user-agent"]);
      const device = `${ua.browser?.name || "Unknown Browser"} on ${
        ua.os?.name || "Unknown OS"
      } ${ua.device?.type || "computer"}`;

      const user = await User.findOne({ email });
      if (!user)
        return {
          success: false,
          message: "Invalid email or password",
          data: null,
        };

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return {
          success: false,
          message: "Invalid email or password",
          data: null,
        };

      const { accessToken, refreshToken } = generateTokens(
        user._id,
        user.role,
        "both"
      );

      user.lastActivity = {
        date: new Date(),
        ip,
        location: "Lagos, Nigeria",
        device,
      };
      await user.save();

      const userObj = user.toObject();
      delete userObj.password;

      return {
        success: true,
        message: "Signin successful",
        data: { ...userObj, accessToken, refreshToken },
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

  static async refreshAccessTokenService(refreshToken) {
    return new Promise((resolve, reject) => {
      if (!refreshToken) {
        return reject(new Error("No refresh token provided"));
      }

      const cleanedToken = refreshToken.trim();

      jwt.verify(
        cleanedToken,
        process.env.JWT_REFRESH_SECRET,
        async (err, decoded) => {
          if (err) {
            console.error("❌ JWT verification error:", err.message);

            if (err.name === "TokenExpiredError") {
              return reject(new Error("Refresh token expired"));
            }

            return reject(new Error("Invalid or malformed refresh token"));
          }

          if (!decoded || !decoded.id || !decoded.role) {
            return reject(new Error("Invalid refresh token payload"));
          }

          const isTokenExpired = Date.now() / 1000 > decoded.exp;
          if (isTokenExpired) {
            return reject(new Error("Refresh token expired"));
          }

          try {
            const user = await User.findById(decoded.id);
            if (!user) {
              return reject(new Error("User not found"));
            }

            const newAccessToken = generateTokens(
              user._id,
              user.role,
              "access"
            );
            console.log(newAccessToken.accessToken, "new");
            resolve(newAccessToken.accessToken);
          } catch (err) {
            reject(new Error("Error fetching user or generating new token"));
          }
        }
      );
    });
  }

  static async logoutService(req) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    return {
      success: true,
      message: "Logout successful",
    };
  }

  static async getUserWallet(userId) {
    const user = await User.findById(userId).select("wallet");
    if (!user) throw new Error("User not found");

    return { wallet: user.wallet };
  }

  static async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: "User not found.", data: null };
      }
      // const resetCode = crypto.randomBytes(20).toString("hex");

      const resetCode = generateRandomSixDigitCode();

      const emailSent = await sendResetPasswordEmail(email, resetCode);

      if (!emailSent || emailSent.message !== "Queued. Thank you.") {
        console.error("❌ Failed to send reset email for:", email, emailSent);
        throw new Error("Reset email could not be sent");
      } else {
        console.log("✅ V");
      }

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
