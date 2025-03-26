const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  }, // Null for admin notifications
  title: { type: String, required: true },
  message: { type: String, required: true },
  forAdmin: { type: Boolean, default: false }, // True if it's an admin notification
  read: { type: Boolean, default: false }, // False when first created
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
