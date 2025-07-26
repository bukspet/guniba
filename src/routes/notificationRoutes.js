const express = require("express");
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/user", authMiddleware, notificationController.getMyNotifications);

// Get admin notifications with optional filters
router.get("/admin", notificationController.getAdminNotifications);
router.post(
  "/read/:id",
  authMiddleware,
  notificationController.markNotificationRead
);

module.exports = router;
