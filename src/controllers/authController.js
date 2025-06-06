const AuthService = require("../services/authService");

class AuthController {
  static async register(req, res) {
    try {
      const { fullName, email, password, referralCode } = req.body;

      const result = await AuthService.signup({
        fullName,
        email,
        password,
        referralCode,
      });

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error("Signup Error:", error);
      return res.status(500).json({
        success: false,
        message: "An internal server error occurred",
        data: null,
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.signin({ email, password });

      if (!result.success) {
        return res.status(401).json(result);
      }
      const isSecure =
        req.secure || req.headers["x-forwarded-proto"] === "https";

      res.cookie("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? isSecure : false,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
      // return res.status(result.success ? 200 : 400).json(result);

      return res.status(200).json({
        success: true,
        message: "Sign in successful",
        data: result.data,
      });
    } catch (error) {
      console.error("Signin Error:", error);
      return res.status(500).json({
        success: false,
        message: "An internal server error occurred",
        data: null,
      });
    }
  }

  static async refreshTokenController(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "No refresh token provided in cookies",
        });
      }

      const newAccessToken = await AuthService.refreshAccessTokenService(
        refreshToken
      );

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
      });
    } catch (error) {
      console.error("Error refreshing token:", error.message);
      return res.status(403).json({
        success: false,
        message: error.message || "Failed to refresh token",
      });
    }
  }

  static async logoutUser(req, res) {
    try {
      console.log("Cookies on logout:", req.cookies);

      if (!req.cookies.refreshToken) {
        throw new Error("No refresh token provided");
      }

      await AuthService.logoutService(req); // your custom logout logic

      const isSecure =
        req.secure || req.headers["x-forwarded-proto"] === "https";

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? isSecure : false,
        sameSite: "strict",
        path: "/", // MUST match how it was set
      });

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Logout failed",
      });
    }
  }

  static async verifyUser(req, res) {
    try {
      const { code } = req.body;
      const result = await AuthService.verifyUser(code);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ success: false, message: "Verification failed." });
    }
  }

  static async resendVerification(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.resendVerification(email);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Resend error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resend verification email.",
      });
    }
  }

  static async requestReset(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred.",
      });
    }
  }

  static async verifyResetCode(req, res) {
    try {
      const { code } = req.body;
      const result = await AuthService.verifyResetEmailRequest(code);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Error verifying reset code:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred.",
      });
    }
  }

  static async resetUserPassword(req, res) {
    try {
      const { code, newPassword } = req.body;
      const result = await AuthService.resetPassword(code, newPassword);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred.",
      });
    }
  }
}

module.exports = AuthController;
