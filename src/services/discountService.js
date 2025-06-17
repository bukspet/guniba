const Discount = require("../models/Discount");

const createDiscount = async (data) => {
  const discount = new Discount(data);
  await discount.save();

  if (discount.status === "active") {
    await Discount.updateMany(
      { _id: { $ne: discount._id } },
      { toDisplay: false }
    );
    discount.toDisplay = true;
    await discount.save();
  }

  return discount;
};

const updateDiscount = async (id, updates) => {
  const discount = await Discount.findByIdAndUpdate(id, updates, { new: true });
  if (!discount) throw new Error("Discount not found");

  if (discount.status === "active") {
    await Discount.updateMany(
      { _id: { $ne: discount._id } },
      { toDisplay: false }
    );
    discount.toDisplay = true;
    await discount.save();
  }

  return discount;
};

const getDiscounts = async (filter = {}) => {
  return await Discount.find(filter).sort({ createdAt: -1 });
};

const deleteDiscount = async (id) => {
  return await Discount.findByIdAndDelete(id);
};

const applyDiscountIfApplicable = async (
  productId,
  categoryId,
  code = null
) => {
  const now = new Date();

  const filter = {
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  };

  const discounts = await Discount.find(filter);

  const applicable = discounts.find((d) => {
    if (d.method === "discountcode" && d.code !== code) return false;
    if (d.products.includes(productId)) return true;
    if (d.categories.includes(categoryId)) return true;
    return false;
  });

  if (!applicable) return null;

  return applicable;
};

module.exports = {
  createDiscount,
  updateDiscount,
  getDiscounts,
  deleteDiscount,
  applyDiscountIfApplicable,
};
