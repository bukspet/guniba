const express = require("express");
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

module.exports = (sendRealTimeNotification) => {
  // Optionally, pass sendRealTimeNotification to controller/service if needed
  // (But from your code, it's used directly in the service where createNotification is called)

  const router = express.Router();

  // Get user notifications
  router.get(
    "/user",
    authMiddleware,
    notificationController.getMyNotifications
  );

  // Get admin notifications
  router.get(
    "/admin",
    adminMiddleware,
    notificationController.getAdminNotifications
  );

  // Mark notification as read
  router.post(
    "/read/:id",
    authMiddleware,
    notificationController.markNotificationRead
  );

  return router;
};
