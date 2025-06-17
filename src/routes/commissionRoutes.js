const express = require("express");
const router = express.Router();
const controller = require("../controllers/commissionController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, controller.getUserCommissions);
router.get("/summary", authMiddleware, controller.getCommissionSummary);
router.post(
  "/transfer-to-wallet",
  authMiddleware,
  controller.transferCommissionToWallet
);
router.post(
  "/withdraw-to-bank",
  authMiddleware,
  controller.withdrawCommissionToBank
);

module.exports = router;
