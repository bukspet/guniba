const WalletTransaction = require("../models/WalletTransaction");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const {
  sendWithdrawalStatusEmail,
} = require("../utils/emailservice/templates/withdwalRequestResponseEmail");

exports.getAllWithdrawalRequests = async () => {
  return WithdrawalRequest.find()
    .populate("user payoutCard actionBy")
    .sort({ createdAt: -1 });
};

exports.getUserWithdrawalRequests = async (userId) => {
  return WithdrawalRequest.find({ user: userId })
    .populate("payoutCard")
    .sort({ createdAt: -1 });
};

exports.updateWithdrawalRequestStatus = async (
  requestId,
  newStatus,
  reasonForRejection,
  actionBy
) => {
  const request = await WithdrawalRequest.findById(requestId).populate("user");
  if (!request) throw new Error("Withdrawal request not found");

  if (request.status !== "pending")
    throw new Error("Request already processed");

  const user = request.user;
  const amount = request.amount;

  if (newStatus === "approved") {
    if (user.commissionBalance < amount) {
      throw new Error("Insufficient commission balance at approval time");
    }
    user.commissionBalance -= amount;
    await user.save();
  }

  if (newStatus === "rejected") {
    request.reasonForRejection = reasonForRejection;
  }

  request.status = newStatus;
  request.actionBy = actionBy;
  await request.save();

  await WalletTransaction.findOneAndUpdate(
    {
      user: user._id,
      amount: amount,
      type: "withdrawal to Bank",
      status: "pending",
    },
    { status: newStatus },
    { new: true }
  );

  if (user.email) {
    await sendWithdrawalStatusEmail(user.email, request);
  }

  return request;
};
