const PayoutCard = require("../models/PayoutCard");

exports.createPayoutCard = async ({
  accountName,
  accountNumber,
  bank,
  user,
  isDefault,
}) => {
  if (isDefault) {
    // Set all other cards for this user to not default
    await PayoutCard.updateMany({ user }, { isDefault: false });
  }

  return await PayoutCard.create({
    accountName,
    accountNumber,
    bank,
    user,
    isDefault,
  });
};

exports.updatePayoutCard = async (cardId, data, userId) => {
  if (data.isDefault) {
    // Set all other cards for this user to not default
    await PayoutCard.updateMany({ user: userId }, { isDefault: false });
  }

  return await PayoutCard.findByIdAndUpdate(cardId, data, {
    new: true,
    runValidators: true,
  });
};
exports.deletePayoutCard = async (cardId) => {
  return await PayoutCard.findByIdAndDelete(cardId);
};

exports.getPayoutCardById = async (cardId) => {
  return await PayoutCard.findById(cardId).populate("user", "name email");
};

exports.getUserPayoutCards = async (userId) => {
  return await PayoutCard.find({ user: userId });
};

exports.getAllPayoutCards = async () => {
  return await PayoutCard.find().populate("user", "name email");
};
