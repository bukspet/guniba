const notificationService = require("../services/notificationService");

exports.getMyNotifications = async (req, res) => {
  try {
    console.log("Fetching notifications for user:", req.user._id);
    const notifications = await notificationService.getUserNotifications(
      req.user._id
    );
    console.log("Notifications fetched:", notifications.length);
    return res.json(notifications);
  } catch (err) {
    console.error("Error in getMyNotifications:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getAdminNotifications();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
