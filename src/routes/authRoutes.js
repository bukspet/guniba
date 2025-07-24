const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/signup", AuthController.register);
router.post("/signin", AuthController.login);
router.post("/logout", AuthController.logoutUser);
router.post("/refresh-token", AuthController.refreshTokenController);
router.get("/wallet", authMiddleware, AuthController.getWalletBalance);
router.post("/request-password-reset", AuthController.requestReset);
router.post("/verify-reset-code", AuthController.verifyResetCode);
router.post("/reset-password", AuthController.resetUserPassword);
router.post("/verify-user", AuthController.verifyUser);
router.post("/resend-verification", AuthController.resendVerification);

module.exports = router;
