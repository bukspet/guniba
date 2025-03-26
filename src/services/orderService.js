const Order = require("../models/Order.js");
const MLMService = require("./mlmService.js");

class OrderService {
  async placeOrder(userId, products, totalAmount) {
    const order = new Order({
      userId,
      products,
      totalAmount,
      status: "processing",
    });

    await order.save();
    await MLMService.calculateCommission(userId, totalAmount);

    return order;
  }

  async getAllOrders() {
    return await Order.find().populate("userId", "fullName email");
  }

  async getOrderById(orderId) {
    return await Order.findById(orderId).populate("userId", "fullName email");
  }

  async confirmOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status !== "processing")
      throw new Error("Order is not in processing state");

    order.status = "completed";
    await order.save();

    // Calculate commissions when the order is confirmed
    await MLMService.calculateCommission(order.userId, order.totalAmount);

    return order;
  }
  async cancelOrder(orderId, userId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status === "completed")
      throw new Error("Cannot cancel a completed order");

    if (order.userId.toString() !== userId)
      throw new Error("Unauthorized to cancel this order");

    order.status = "canceled";
    await order.save();

    return order;
  }
}

module.exports = new OrderService();
