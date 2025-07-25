const Notification = require("../models/Notification");

exports.createNotification = async ({
  userId,
  title,
  message,
  forAdmin = false,
}) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    forAdmin,
  });

  return notification;
};

// Mark as read
exports.markAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
};

// Get user notifications
exports.getUserNotifications = async (userId) => {
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

// Get admin notifications
exports.getAdminNotifications = async () => {
  return Notification.find({ forAdmin: true }).sort({ createdAt: -1 });
};
