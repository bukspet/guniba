const express = require("express");
const router = express.Router();
const ShippingAddressController = require("../controllers/shippingAddressController");
// const authMiddleware = require("../middlewares/auth"); // If you have one

// router.use(authMiddleware); // Protect routes

router.post("/shipping-address", ShippingAddressController.create);
router.put("/shipping-address/:id", ShippingAddressController.update);
router.delete("/shipping-address/:id", ShippingAddressController.delete);
router.get("/shipping-address", ShippingAddressController.getAll);
router.get("/shipping-address/:id", ShippingAddressController.getById);

module.exports = router;
