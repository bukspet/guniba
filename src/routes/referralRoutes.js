// routes/referralRoutes.js
const express = require("express");
const router = express.Router();
const ReferralController = require("../controllers/referralController");

// GET /api/referrals/:userId
router.get("/:userId", ReferralController.getUserReferrals);

module.exports = router;
