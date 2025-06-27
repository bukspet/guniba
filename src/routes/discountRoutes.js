const express = require("express");
const router = express.Router();
const discountCtrl = require("../controllers/discountController");
const authMiddleware = require("../middlewares/authMiddleware");
router.post("/", discountCtrl.createDiscount);
router.put("/:id", discountCtrl.updateDiscount);
router.delete("/:id", discountCtrl.deleteDiscount);
router.get("/", discountCtrl.getDiscounts);
router.get("/:id", discountCtrl.getDiscount);
router.patch("/:id/status", discountCtrl.changeDiscountStatus);
router.post("/validate-code", discountCtrl.validateDiscountCode);

module.exports = router;
