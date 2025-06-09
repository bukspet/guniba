const express = require("express");
const router = express.Router();
const controller = require("../controllers/commissionController");
const auth = require("../middlewares/auth");

router.get("/", auth, controller.getUserCommissions);
router.get("/summary", auth, controller.getCommissionSummary);
router.post("/transfer-to-wallet", auth, controller.transferCommissionToWallet);
router.post("/withdraw-to-bank", auth, controller.withdrawCommissionToBank);

module.exports = router;
