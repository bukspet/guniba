const {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscounts,
  getDiscount,
  changeStatus,
  applyDiscountIfApplicable,
} = require("../services/discountService");

exports.createDiscount = async (req, res) => {
  try {
    const discount = await createDiscount(req.body);
    console.log(discount, "here 2");
    res.status(201).json({ success: true, data: discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const discount = await updateDiscount(req.params.id, req.body);
    if (!discount) throw new Error("Discount not found");

    res.json({ success: true, data: discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 🔹 Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await deleteDiscount(req.params.id);

    res.json({ success: true, message: "Discount deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 🔹 Get all discounts
exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await getDiscounts();
    res.json({ success: true, data: discounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get single discount
exports.getDiscount = async (req, res) => {
  try {
    const discount = await getDiscount(req.params.id);
    if (!discount) throw new Error("Discount not found");
    res.json({ success: true, data: discount });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// 🔹 Change status (active, draft, cancel)
exports.changeDiscountStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "draft", "cancelled"].includes(status)) {
      throw new Error("Invalid status");
    }

    const discount = await changeStatus(req.params.id, status);

    res.json({ success: true, data: discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 🔹 Apply discount code (at checkout)
exports.validateDiscountCode = async (req, res) => {
  try {
    const { code, productId, categoryId } = req.body;

    const discount = await applyDiscountIfApplicable(
      productId,
      categoryId,
      code
    );

    if (!discount) {
      return res.status(404).json({ success: false, valid: false });
    }

    res.json({ success: true, data: discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
