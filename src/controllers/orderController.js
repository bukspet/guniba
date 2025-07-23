const orderService = require("../services/orderService");

exports.createOrderController = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await orderService.createOrder(userId, req.body.items);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateOrderStatusController = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Order IDs must be a non-empty array." });
    }

    const updatedOrders = await orderService.updateMultipleOrderStatus(
      orderIds,
      status
    );

    res.json({ message: "Orders updated successfully", orders: updatedOrders });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.confirmReceivedController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.confirmOrderReceived(orderId);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrdersController = async (req, res) => {
  try {
    const { orderNo, status, dateRange } = req.query;
    const orders = await orderService.getAllOrdersForUser(
      req.user._id,
      orderNo,
      status,
      dateRange
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrderSummaryController = async (req, res) => {
  try {
    const summary = await orderService.getUserOrdersSummary(req.user.id);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminOrderSummaryController = async (req, res) => {
  try {
    const summary = await orderService.getAdminOrdersSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getOrderByIdController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);
    res.status(200).json(order);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
