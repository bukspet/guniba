const express = require("express");
const OrderController = require("../controllers/orderController");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.post(
  "/create-order",
  authMiddleware,
  OrderController.createOrderController
);
router.get("/", OrderController.getAllOrdersController);
router.get("/user", authMiddleware, OrderController.getUserOrdersController);

router.get(
  "/summary",
  authMiddleware,
  OrderController.getUserOrderSummaryController
);
router.get(
  "/admin-order-summary",
  adminMiddleware,
  OrderController.getAdminOrderSummaryController
);
router.put(
  "/update-order",
  authMiddleware,
  OrderController.updateOrderStatusController
);
router.get("/:orderId", authMiddleware, OrderController.getOrderByIdController);
router.put(
  "/confirm/:orderId",
  authMiddleware,
  OrderController.confirmReceivedController
);

module.exports = router;
