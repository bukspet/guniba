const notificationService = require("../services/notificationService");

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming auth middleware
    const notifications = await notificationService.getUserNotifications(
      userId
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
