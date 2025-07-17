const Order = require("../models/Order");
const User = require("../models/User");
const ReadyToReview = require("../models/Product"); // Assuming this exists
const MLMService = require("./mlmService"); // Assuming this exists
const notificationService = require("./notificationService");
const { sendRealTimeNotification } = require("../utils/socketManager");

const generateOrderNo = () => {
  return `GU-${Math.floor(100000000 + Math.random() * 900000000)}`;
};

exports.createOrder = async (userId, items, totalPrice, method) => {
  const order = await Order.create({
    user: userId,
    items,
    totalPrice,
    method,
    orderNo: generateOrderNo(),
  });

  // Notifications (unchanged)
  await notificationService.createNotification({
    userId: null,
    title: "New Order Created",
    message: `A new order has been placed (Order No: ${order.orderNo}).`,
    forAdmin: true,
  });

  await notificationService.createNotification({
    userId,
    title: "Order Created",
    message: "Your order was successfully created.",
    forAdmin: false,
  });

  return order;
};

exports.updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  // Update status and relevant timestamp
  order.status = status;

  if (status === "Shipped") {
    order.shippedAt = new Date(); // Record shipping time
  }

  if (status === "Return") {
    const user = await User.findById(order.user);
    user.wallet += order.totalPrice;
    await user.save();
  }

  await order.save();

  // Send status update notification
  await notificationService.createNotification({
    userId: order.user,
    title: `Order ${status}`,
    message: `Your order (Order No: ${order.orderNo}) is now ${status}.`,
    forAdmin: false,
  });

  return order;
};

exports.confirmOrderReceived = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  order.status = "Completed";
  order.completedAt = new Date(); // Record completion time

  await order.save();

  // Update product stats
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        order: 1,
        revenue: item.price * item.quantity,
      },
    });
  }

  // Create ready-to-review entries
  for (const item of order.items) {
    await ReadyToReview.create({
      userId: order.user,
      productId: item.productId,
      variantId: item.variantId || null,
      orderId: order._id,
    });
  }

  // Calculate MLM commission
  await MLMService.calculateCommission(order.user, order.totalPrice);

  // Notify user
  await notificationService.createNotification({
    userId: order.user,
    title: "Order Completed",
    message: `Your order (Order No: ${order.orderNo}) has been marked as completed.`,
    forAdmin: false,
  });

  return {
    success: true,
    message: "Order marked as completed. Items ready for review.",
  };
};

exports.getAllOrders = async (filter = {}) => {
  return await Order.find(filter).populate("user items.variantId");
};

exports.getAllOrdersForUser = async (userId, orderNo, status, dateRange) => {
  const filter = { user: userId };

  if (orderNo) {
    filter.orderNo = { $regex: `^${orderNo.trim()}`, $options: "i" };
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  if (dateRange) {
    const now = new Date();
    let startDate;

    if (dateRange === "last30days") {
      startDate = new Date(now.setDate(now.getDate() - 30));
    } else if (dateRange === "last7days") {
      startDate = new Date(now.setDate(now.getDate() - 7));
    }

    if (startDate) {
      filter.createdAt = { $gte: startDate };
    }
  }

  return await Order.find(filter).populate({
    path: "items.variantId",
    populate: {
      path: "productId",
      select: "name images variantTypes",
      populate: {
        path: "variantTypes", // Populate the variantTypes array
        select: "_id name", // Select only name or other fields you need
      },
    },
  });
};

exports.getUserOrdersSummary = async (userId) => {
  const orders = await Order.find({ user: userId });

  const summary = {
    totalOrders: orders.length,
    totalAmount: 0,
    completed: { count: 0, amount: 0 },
    processing: { count: 0, amount: 0 },
    shipped: { count: 0, amount: 0 },
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
    completed: { count: 0, amount: 0 },
    processing: { count: 0, amount: 0 },
    shipped: { count: 0, amount: 0 },
    return: { count: 0, amount: 0 },
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
    .populate("user", "name email")
    .populate({
      path: "items.variantId",
      populate: {
        path: "productId",
        select: "name images variantTypes",
        populate: {
          path: "variantTypes",
          select: "_id name",
        },
      },
    })
    .exec();

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};
