const express = require("express");
const OrderController = require("../controllers/orderController");

const router = express.Router();

router.post("/create-order", OrderController.createOrderController);
router.get("/", OrderController.getAllOrdersController);
router.get("/user", OrderController.getUserOrdersController);

router.get("/summary", OrderController.getUserOrderSummaryController);
router.get(
  "/admin-order-summary",
  OrderController.getAdminOrderSummaryController
);
router.put("/update-order", OrderController.updateOrderStatusController);
router.get("/:orderId", OrderController.getOrderByIdController);
router.put("/confirm/:orderId", OrderController.confirmReceivedController);

module.exports = router;
