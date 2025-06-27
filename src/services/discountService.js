const Discount = require("../models/Discount.js");

// Create
const createDiscount = async (data) => {
  const discount = new Discount(data);
  await discount.save();

  // If status is active, ensure single toDisplay
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

// Update
const updateDiscount = async (id, updates) => {
  const discount = await Discount.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!discount) throw new Error("Discount not found");

  if (discount.status === "active" && updates.toDisplay === true) {
    await Discount.updateMany(
      { _id: { $ne: discount._id } },
      { toDisplay: false }
    );
  }

  return discount;
};

// Delete
const deleteDiscount = async (id) => {
  const discount = await Discount.findByIdAndDelete(id);
  if (!discount) throw new Error("Discount not found");
  return discount;
};

// Get all + auto mark expired
const getDiscounts = async () => {
  const now = new Date();
  const discounts = await Discount.find().sort({ createdAt: -1 });

  // Check expiry
  const updates = discounts.map(async (d) => {
    if (d.endDate && d.endDate < now && d.status !== "expired") {
      d.status = "expired";
      await d.save();
    }
  });
  await Promise.all(updates);

  return await Discount.find().sort({ createdAt: -1 });
};

// Get single
const getDiscount = async (id) => {
  const discount = await Discount.findById(id);
  if (!discount) throw new Error("Discount not found");
  if (
    discount.endDate &&
    discount.endDate < new Date() &&
    discount.status !== "expired"
  ) {
    discount.status = "expired";
    await discount.save();
  }
  return discount;
};

// Change status
const changeStatus = async (id, status) => {
  if (!["active", "draft", "expired", "canceled"].includes(status)) {
    throw new Error("Invalid status");
  }
  const discount = await Discount.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!discount) throw new Error("Discount not found");
  return discount;
};

// Validate + apply code
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
  return (
    discounts.find((d) => {
      if (d.method === "discountcode" && d.discountCode !== code) return false;
      if (d.products.includes(productId)) return true;
      if (d.categories.includes(categoryId)) return true;
      return false;
    }) || null
  );
};

module.exports = {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscounts,
  getDiscount,
  changeStatus,
  applyDiscountIfApplicable,
};
