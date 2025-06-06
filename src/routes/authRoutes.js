const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", AuthController.register);
router.post("/signin", AuthController.login);
router.post("/refresh-token", AuthController.refreshTokenController);
router.post("/request-password-reset", AuthController.requestReset);
router.post("/verify-reset-code", AuthController.verifyResetCode);
router.post("/reset-password", AuthController.resetUserPassword);
router.post("/verify-user", AuthController.verifyUser);
router.post("/resend-verification", AuthController.resendVerification);

module.exports = router;
