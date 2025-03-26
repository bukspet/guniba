const express = require("express");
const OrderController = require("../controllers/orderController");

const router = express.Router();

router.post("/checkout", OrderController.checkout);
router.get("/", OrderController.getAllOrders);
router.get("/:orderId", OrderController.getOrderById);
router.put("/confirm/:orderId", OrderController.confirmOrder);
router.put("/cancel/:orderId", OrderController.cancelOrder); // New Cancel Order Route

module.exports = router;
