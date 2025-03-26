const express = require("express");

module.exports = (sendRealTimeNotification) => {
  const NotificationService = require("../services/notificationService.js")(
    sendRealTimeNotification
  );
  const authMiddleware = require("../middlewares/authMiddleware");
  const adminMiddleware = require("../middlewares/adminMiddleware");

  const router = express.Router();

  router.get("/user", authMiddleware, async (req, res) => {
    try {
      const notifications = await NotificationService.getUserNotifications(
        req.user.userId
      );
      res.json(notifications);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  router.get("/admin", adminMiddleware, async (req, res) => {
    try {
      const notifications = await NotificationService.getAdminNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/read/:notificationId", authMiddleware, async (req, res) => {
    try {
      await NotificationService.markAsRead(req.params.notificationId);
      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  return router;
};
