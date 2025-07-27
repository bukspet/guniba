const express = require("express");
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const router = express.Router();

router.get("/user", authMiddleware, notificationController.getMyNotifications);

router.get(
  "/admin",
  adminMiddleware,
  notificationController.getAdminNotifications
);
router.post(
  "/read/:id",
  authMiddleware,
  notificationController.markNotificationRead
);

module.exports = router;
