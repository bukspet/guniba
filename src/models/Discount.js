const discountService = require("../services/discountService");

exports.createDiscount = async (req, res) => {
  try {
    const discount = await discountService.createDiscount(req.body);
    res.status(201).json({ success: true, data: discount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const discount = await discountService.updateDiscount(
      req.params.id,
      req.body
    );
    res.json({ success: true, data: discount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    await discountService.deleteDiscount(req.params.id);
    res.json({ success: true, message: "Discount deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await discountService.getDiscounts();
    res.json({ success: true, data: discounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDiscount = async (req, res) => {
  try {
    const discount = await discountService.getDiscount(req.params.id);
    res.json({ success: true, data: discount });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const discount = await discountService.changeStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: discount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.validateDiscountCode = async (req, res) => {
  try {
    const { productId, categoryId, code } = req.body;
    const discount = await discountService.applyDiscountIfApplicable(
      productId,
      categoryId,
      code
    );
    if (!discount) throw new Error("No valid discount found");
    res.json({ success: true, data: discount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
