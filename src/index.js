const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");
const { startPaymentFallbackJob } = require("./jobs/paymentJobs.js");
const {
  initSocket,
  sendRealTimeNotification,
} = require("./utils/socketManager.js");

// Routes
const authRoutes = require("./routes/authRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const wishlistRoutes = require("./routes/wishlistRoutes.js");

const mlmRoutes = require("./routes/mlmRoutes.js");
const withdrawalRequestRoutes = require("./routes/withdrawalRequestRoutes.js");

const paymentRoutes = require("./routes/paymentRoutes.js");
const discountRoutes = require("./routes/discountRoutes.js");
const commissionRoutes = require("./routes/commissionRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const payoutcardRoutes = require("./routes/payoutcardRoutes.js");
const walletRoutes = require("./routes/walletRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const referralRoutes = require("./routes/referralRoutes.js");
const shippingAddressRoutes = require("./routes/shippingAddressRoutes.js");
const searchedWordRoutes = require("./routes/searchedWordRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://www.guniba.net",
      "https://guniba-client.vercel.app",
    ],
    credentials: true,
  },
});

// Initialize WebSocket handling
initSocket(io);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://guniba-client.vercel.app",
      "https://www.guniba.net",
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/mlm", mlmRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/cart", cartRoutes);
app.use("/api/withdrawal", withdrawalRequestRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/commission", commissionRoutes);
app.use("/api/payout-card", payoutcardRoutes);
app.use("/api/discount", discountRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api", shippingAddressRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/searched-words", searchedWordRoutes);

// Start server after DB connects
connectDB()
  .then(() => {
    // startPaymentFallbackJob();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  });
