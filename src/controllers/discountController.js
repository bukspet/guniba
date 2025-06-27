const Discount = require("../models/Discount");

exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount(req.body);
    discount.status = "draft";
    await discount.save();
    res.status(201).json({ success: true, data: discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!discount) throw new Error("Discount not found");

    if (req.body.toDisplay === true) {
      await Discount.updateMany(
        { _id: { $ne: discount._id } },
        { toDisplay: false }
      );
    }

    res.json({ success: true, data: discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 🔹 Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) throw new Error("Discount not found");
    res.json({ success: true, message: "Discount deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 🔹 Get all discounts
exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json({ success: true, data: discounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get single discount
exports.getDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
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

    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!discount) throw new Error("Discount not found");

    res.json({ success: true, data: discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 🔹 Apply discount code (at checkout)
exports.validateDiscountCode = async (req, res) => {
  try {
    const { code, productIds, categoryIds, date } = req.body;

    const discount = await Discount.findOne({
      method: "discountcode",
      discountCode: code,
      status: "active",
      startDate: { $lte: date },
      endDate: { $gte: date },
    });

    if (!discount) throw new Error("Invalid or expired discount code");

    // Check if applicable to provided products or categories
    const applicable =
      discount.products.some((id) => productIds.includes(id.toString())) ||
      discount.categories.some((id) => categoryIds.includes(id.toString()));

    if (!applicable)
      throw new Error(
        "Discount code not valid for selected products/categories"
      );

    res.json({ success: true, data: discount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
