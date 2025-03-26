const OrderService = require("../services/orderService");

class OrderController {
  async checkout(req, res) {
    try {
      const { userId, items, totalAmount } = req.body;
      const order = await OrderService.placeOrder(userId, items, totalAmount);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async getAllOrders(req, res) {
    try {
      const orders = await OrderService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const order = await OrderService.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async confirmOrder(req, res) {
    try {
      const { orderId } = req.params;
      const order = await OrderService.confirmOrder(orderId);
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.body.userId;

      const order = await OrderService.cancelOrder(orderId, userId);
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new OrderController();
