const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");
const { startPaymentFallbackJob } = require("./jobs/paymentJobs.js");

// Routes
const authRoutes = require("./routes/authRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const mlmRoutes = require("./routes/mlmRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const referralRoutes = require("./routes/referralRoutes");
const shippingAddressRoutes = require("./routes/shippingAddressRoutes");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://guniba-client.vercel.app",
    ],
    credentials: true,
  },
});

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://guniba-client.vercel.app",
    ],
    credentials: true,
  })
);

// Store online users
const onlineUsers = new Map();

// WebSocket connection
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("register", ({ userId, isAdmin }) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} is online`);
    }
    if (isAdmin) {
      socket.join("adminRoom");
      console.log(`👑 Admin joined adminRoom: ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Function to send real-time notifications
const sendRealTimeNotification = ({
  userId,
  forAdmin = false,
  notification,
}) => {
  if (forAdmin) {
    io.to("adminRoom").emit("new_notification", notification);
  } else if (userId) {
    const userSocketId = onlineUsers.get(userId);
    if (userSocketId) {
      io.to(userSocketId).emit("new_notification", notification);
    }
  }
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mlm", mlmRoutes);
app.use("/api/orders", orderRoutes(sendRealTimeNotification));
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/shipping-address", shippingAddressRoutes);
app.use("/api/notifications", notificationRoutes(sendRealTimeNotification));

// Start server after DB connects
connectDB()
  .then(() => {
    startPaymentFallbackJob();

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  });
