const express = require("express");
const router = express.Router();
const ShippingAddressController = require("../controllers/shippingAddressController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/shipping-address", ShippingAddressController.create);
router.put("/shipping-address/:id", ShippingAddressController.update);
router.delete("/shipping-address/:id", ShippingAddressController.delete);
router.get("/shipping-address", ShippingAddressController.getAll);
router.get("/shipping-address/:id", ShippingAddressController.getById);

module.exports = router;
