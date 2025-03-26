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

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Signin Error:", error);
      return res.status(500).json({
        success: false,
        message: "An internal server error occurred",
        data: null,
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
