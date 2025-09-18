const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");
const { Product, ReadyToReview } = require("../models/Product");
const MLMService = require("./mlmService"); // Assuming this exists
const notificationService = require("./notificationService");
const { sendRealTimeNotification } = require("../utils/socketManager");
const ShippingAddress = require("../models/ShippingAddress");
const {
  sendOrderCreatedEmail,
} = require("../utils/emailservice/templates/orderEmail");
const {
  sendOrderShippedEmail,
} = require("../utils/emailservice/templates/orderShippedEmail");

const generateOrderNo = () => {
  return `GU-${Math.floor(100000000 + Math.random() * 900000000)}`;
};

exports.createOrder = async (
  userId,
  items,
  totalPrice,
  method,
  shippingAddressId
) => {
  if (!shippingAddressId) {
    throw new Error("Shipping address is required");
  }

  const addressExists = await ShippingAddress.findById(shippingAddressId);
  if (!addressExists) {
    throw new Error("Invalid shipping address");
  }

  const order = await Order.create({
    user: userId,
    items,
    totalPrice,
    method,
    orderNo: generateOrderNo(),
    shippingAddress: shippingAddressId,
  });

  // ✅ Notifications
  await notificationService.createNotification({
    userId,
    title: "New Order Created",
    message: `A new order has been placed (Order No: ${order.orderNo}).`,
    forAdmin: true,
    type: "order",
  });

  await notificationService.createNotification({
    userId,
    title: "Order Created",
    message: "Your order was successfully created.",
    forAdmin: false,
    type: "order",
  });

  // ✅ Send Email to User
  const user = await User.findById(userId).select("email");
  if (user?.email) {
    const emailSent = await sendOrderCreatedEmail(user.email, order);

    if (!emailSent || emailSent.message !== "Queued. Thank you.") {
      console.error(
        "❌ Failed to send order email for:",
        user.email,
        emailSent
      );
    } else {
      console.log("✅ Order email sent to:", user.email);
    }
  }

  return order;
};

exports.updateMultipleOrderStatus = async (orderIds, status) => {
  const validIds = orderIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (validIds.length === 0) {
    throw new Error("No valid Order IDs provided.");
  }

  const updatedOrders = [];

  for (const id of validIds) {
    const order = await Order.findById(id).populate("user", "email");
    if (!order) continue;

    order.status = status;

    if (status === "Shipped") {
      order.shippedAt = new Date();

      if (order.user?.email) {
        const emailSent = await sendOrderShippedEmail(order.user.email, order);

        if (!emailSent || emailSent.message !== "Queued. Thank you.") {
          console.error(
            "❌ Failed to send shipped email for:",
            order.user.email,
            emailSent
          );
        } else {
          console.log("✅ Shipped email sent to:", order.user.email);
        }
      }
    }

    if (status === "Return") {
      const user = await User.findById(order.user);
      if (user) {
        user.wallet += order.totalPrice;
        await user.save();
      }
    }

    await order.save();

    await notificationService.createNotification({
      userId: order.user._id || order.user,
      title: `Order ${status}`,
      message: `Your order (Order No: ${order.orderNo}) is now ${status}.`,
      forAdmin: false,
      type: "order",
    });

    updatedOrders.push(order);
  }

  return updatedOrders;
};

exports.confirmOrderReceived = async (orderId) => {
  const order = await Order.findById(orderId).populate({
    path: "items.variantId",
    populate: {
      path: "productId",
      select: "name images variantTypes",
      populate: {
        path: "variantTypes",
        select: "_id name",
      },
    },
  });

  if (!order) throw new Error("Order not found");

  // ✅ Update order status
  order.status = "Completed";
  order.completedAt = new Date();
  await order.save();

  // ✅ Update product stats
  for (const item of order.items) {
    const productId = item.variantId?.productId?._id;
    if (productId) {
      await Product.findByIdAndUpdate(productId, {
        $inc: {
          order: 1,
          revenue: item.price * item.quantity,
        },
      });
    } else {
      console.warn("Product ID missing for item:", item);
    }
  }

  // ✅ Create ready-to-review entries
  for (const item of order.items) {
    await ReadyToReview.create({
      userId: order.user,
      productId: item.variantId?.productId?._id,
      variantId: item.variantId?._id || null,
      orderId: order._id,
    });
  }

  // ✅ Calculate MLM commission
  await MLMService.calculateCommission(order.user, order.totalPrice, order._id);
  console.log(order._id, order, "orderId 1");
  // ✅ Notify user
  await notificationService.createNotification({
    userId: order.user,
    title: "Order Completed",
    message: `Your order (Order No: ${order.orderNo}) has been marked as completed.`,
    forAdmin: false,
    type: "order",
  });

  return {
    success: true,
    message: "Order marked as completed. Items ready for review.",
  };
};

exports.getAllOrders = async (filter = {}) => {
  return await Order.find(filter)
    .populate("user items.variantId")
    .sort({ createdAt: -1 });
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

  return await Order.find(filter)
    .populate({
      path: "items.variantId",
      populate: {
        path: "productId",
        select: "name images variantTypes",
        populate: {
          path: "variantTypes", // Populate the variantTypes array
          select: "_id name", // Select only name or other fields you need
        },
      },
    })
    .sort({ createdAt: -1 }); // ✅ Most recent first
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
    .populate("user", "name email phone")
    .populate("shippingAddress")
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
