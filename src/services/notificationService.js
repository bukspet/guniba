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
// Get user notifications with user details
exports.getUserNotifications = async (userId) => {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .populate("userId", "name email"); // Only populate selected fields
};

// Get admin notifications with user details (if any)
exports.getAdminNotifications = async () => {
  return Notification.find({ forAdmin: true })
    .sort({ createdAt: -1 })
    .populate("userId", "name email");
};
