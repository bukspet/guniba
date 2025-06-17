const express = require("express");
const WithdrawalController = require("../controllers/withdrawalRequestController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Admin: Get all withdrawal requests
router.get(
  "/",
  authMiddleware,
  WithdrawalController.getAllWithdrawalRequestsController
);

// User: Get own withdrawal requests
router.get(
  "/user",
  authMiddleware,
  WithdrawalController.getUserWithdrawalRequestsController
);

// Admin: Update withdrawal request status
router.put(
  "/:requestId/status",
  authMiddleware,
  WithdrawalController.updateWithdrawalRequestStatusController
);

module.exports = router;
