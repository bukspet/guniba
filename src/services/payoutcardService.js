const PayoutCard = require("../models/PayoutCard");

exports.createPayoutCard = async (data) => {
  return await PayoutCard.create(data);
};

exports.updatePayoutCard = async (cardId, data) => {
  return await PayoutCard.findByIdAndUpdate(cardId, data, { new: true });
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
