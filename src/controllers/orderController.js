const OrderService = require("../services/orderService");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await orderService.createOrder(userId, req.body.items);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderService.updateOrderStatus(orderId, status);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.confirmReceived = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderService.confirmOrderReceived(orderId);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrdersForAdmin(req.query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrdersForUser(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrderSummary = async (req, res) => {
  try {
    const summary = await orderService.getUserOrdersSummary(req.user.id);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminOrderSummary = async (req, res) => {
  try {
    const summary = await orderService.getAdminOrdersSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);
    res.status(200).json(order);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// class OrderController {
//   async checkout(req, res) {
//     try {
//       const { userId, items, totalAmount } = req.body;
//       const order = await OrderService.placeOrder(userId, items, totalAmount);
//       res.status(201).json(order);
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }

//   async getAllOrders(req, res) {
//     try {
//       const orders = await OrderService.getAllOrders();
//       res.status(200).json(orders);
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }

//   async getOrderById(req, res) {
//     try {
//       const { orderId } = req.params;
//       const order = await OrderService.getOrderById(orderId);
//       if (!order) return res.status(404).json({ message: "Order not found" });

//       res.status(200).json(order);
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }

//   async confirmOrder(req, res) {
//     try {
//       const { orderId } = req.params;
//       const order = await OrderService.confirmOrder(orderId);
//       res.status(200).json(order);
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }
//   async cancelOrder(req, res) {
//     try {
//       const { orderId } = req.params;
//       const userId = req.body.userId;

//       const order = await OrderService.cancelOrder(orderId, userId);
//       res.status(200).json(order);
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }
// }

// module.exports = new OrderController();
