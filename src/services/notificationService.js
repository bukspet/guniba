const Notification = require("../models/Notification");

exports.createNotification = async ({
  userId,
  title,
  message,
  type,
  forAdmin = false,
}) => {
  if (!["order", "request", "auth"].includes(type)) {
    throw new Error(
      "Invalid notification type. Must be 'order', 'request', or 'auth'."
    );
  }

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
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
exports.getUserNotifications = async (userId, query = {}) => {
  const filters = { userId };

  // Apply query filters dynamically
  if (query.type) {
    filters.type = { $in: query.type.split(",") }; // multiple types supported
  }
  if (query.read !== undefined) {
    filters.read = query.read === "true"; // convert to boolean
  }

  return Notification.find(filters)
    .sort({ createdAt: -1 })
    .populate("userId", "fullName email");
};

exports.getAdminNotifications = async (query = {}) => {
  const filters = { forAdmin: true };

  if (query.type) {
    filters.type = { $in: query.type.split(",") };
  }
  if (query.read !== undefined) {
    filters.read = query.read === "true";
  }

  return Notification.find(filters)
    .sort({ createdAt: -1 })
    .populate("userId", "fullName email");
};
