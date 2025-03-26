const Notification = require("../models/Notification.js");
const { sendEmail } = require("../utils/NotificationUtils");
const User = require("../models/User.js");
class NotificationService {
  constructor(sendRealTimeNotification) {
    this.sendRealTimeNotification = sendRealTimeNotification;
  }

  async sendNotification(userId, title, message, forAdmin = false) {
    const notification = await Notification.create({
      userId,
      title,
      message,
      forAdmin,
    });

    // Send real-time notification
    if (userId) {
      this.sendRealTimeNotification(userId, notification);

      // Also send email
      const user = await User.findById(userId);
      if (user?.email) {
        await sendEmail(user.email, title, message);
      }
    }
  }

  async getUserNotifications(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  async getAdminNotifications() {
    return await Notification.find({ forAdmin: true }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId) {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
  }
}

module.exports = (sendRealTimeNotification) =>
  new NotificationService(sendRealTimeNotification);
