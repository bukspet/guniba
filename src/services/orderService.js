const Order = require("../models/Order");
const User = require("../models/User");
const notificationService = require("./notificationService");

const generateOrderNo = () => {
  return `GU-${Math.floor(100000000 + Math.random() * 900000000)}`;
};

exports.createOrder = async (userId, items, io) => {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    user: userId,
    items,
    totalPrice,
    orderNo: generateOrderNo(),
  });

  // Notify admin
  await createNotification(
    {
      userId: someUserId,
      title: "Order Created",
      message: "Your order was successfully created.",
      forAdmin: false,
    },
    sendRealTimeNotification
  );

  return order;
};
exports.updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  order.status = status;

  if (status === "Return") {
    const user = await User.findById(order.user);
    user.wallet += order.totalPrice;
    await user.save();
  }

  await order.save();

  // Trigger MLM logic after order is marked completed
  if (status === "Completed") {
    await MLMService.calculateCommission(order.user, order.totalPrice);
  }

  return order;
};

exports.confirmOrderReceived = async (orderId) => {
  // 1️⃣ Mark order as Completed
  const order = await exports.updateOrderStatus(orderId, "Completed");

  // 2️⃣ Create ReadyToReview entries
  for (const item of order.items) {
    await ReadyToReview.create({
      userId: order.user,
      productId: item.productId,
      variantId: item.variantId || null,
      orderId: order._id,
    });
  }

  return {
    success: true,
    message: "Order marked as completed, ready to review items added.",
  };
};
exports.getAllOrders = async (filter = {}) => {
  return await Order.find(filter).populate("user items.variantId");
};

exports.getAllOrdersForUser = async (userId) => {
  return await Order.find({ user: userId }).populate("items.variantId");
};

exports.getUserOrdersSummary = async (userId) => {
  const orders = await Order.find({ user: userId });

  const summary = {
    totalOrders: orders.length,
    totalAmount: 0,
    completed: {
      count: 0,
      amount: 0,
    },
    processing: {
      count: 0,
      amount: 0,
    },
    shipped: {
      count: 0,
      amount: 0,
    },
  };

  for (const order of orders) {
    summary.totalAmount += order.totalPrice;

    if (order.status === "Completed") {
      summary.completed.count++;
      summary.completed.amount += order.totalPrice;
    } else if (order.status === "Processing") {
      summary.processing.count++;
      summary.processing.amount += order.totalPrice;
    } else if (order.status === "Shipped") {
      summary.shipped.count++;
      summary.shipped.amount += order.totalPrice;
    }
  }

  return summary;
};
exports.getAdminOrdersSummary = async () => {
  const orders = await Order.find({});

  const summary = {
    totalOrders: orders.length,
    totalAmount: 0,
    completed: {
      count: 0,
      amount: 0,
    },
    processing: {
      count: 0,
      amount: 0,
    },
    shipped: {
      count: 0,
      amount: 0,
    },
    return: {
      count: 0,
      amount: 0,
    },
  };

  for (const order of orders) {
    summary.totalAmount += order.totalPrice;

    if (order.status === "Completed") {
      summary.completed.count++;
      summary.completed.amount += order.totalPrice;
    } else if (order.status === "Processing") {
      summary.processing.count++;
      summary.processing.amount += order.totalPrice;
    } else if (order.status === "Shipped") {
      summary.shipped.count++;
      summary.shipped.amount += order.totalPrice;
    } else if (order.status === "Return") {
      summary.return.count++;
      summary.return.amount += order.totalPrice;
    }
  }

  return summary;
};

exports.getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email") // Optional: only return selected user fields
    .populate("items.variantId") // Adjust field names as needed
    .exec();

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};
