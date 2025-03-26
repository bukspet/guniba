const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./config/db.js");

const authRoutes = require("./routes/authRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const mlmRoutes = require("./routes/mlmRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const walletRoutes = require("./routes/walletRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active users
const onlineUsers = new Map();

// WebSocket connection
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Register user
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} is online`);
  });

  // Remove user on disconnect
  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
    console.log("❌ User disconnected:", socket.id);
  });
});

// Function to send real-time notifications
const sendRealTimeNotification = (userId, notification) => {
  const userSocketId = onlineUsers.get(userId);
  if (userSocketId) {
    io.to(userSocketId).emit("new_notification", notification);
  }
};

// Routes (pass `sendRealTimeNotification` to notificationRoutes)
app.use("/api/notifications", notificationRoutes(sendRealTimeNotification));

app.use("/api/auth", authRoutes);
app.use("/api/mlm", mlmRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api", cartRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);

app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
