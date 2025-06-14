const WithdrawalRequest = require("../models/WithdrawalRequest");
const WalletTransaction = require("../models/WalletTransaction");
const User = require("../models/User");

const generateTransactionId = () =>
  "RF" + Math.floor(1000000000 + Math.random() * 9000000000);

// exports.createWithdrawalRequest = async ({ userId, amount, payoutCardId }) => {
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");

//   if (user.commissionBalance < amount) {
//     throw new Error("Insufficient commission balance");
//   }

//   // Create WalletTransaction (status: pending)
//   await WalletTransaction.create({
//     user: userId,
//     transactionId: generateTransactionId(),
//     type: "withdrawal",
//     amount,
//     status: "pending",
//   });

//   // Create WithdrawalRequest
//   const request = await WithdrawalRequest.create({
//     requestId: generateTransactionId(),
//     user: userId,
//     amount,
//     payoutCard: payoutCardId,
//     source: "commission",
//   });

//   return request;
// };

exports.getAllWithdrawalRequests = async () => {
  return WithdrawalRequest.find()
    .populate("user payoutCard")
    .sort({ createdAt: -1 });
};

exports.getUserWithdrawalRequests = async (userId) => {
  return WithdrawalRequest.find({ user: userId })
    .populate("payoutCard")
    .sort({ createdAt: -1 });
};

exports.updateWithdrawalRequestStatus = async (requestId, newStatus) => {
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

    if (request.withdrawalType === "bank") {
      user.commissionBalance -= amount;
    }

    await user.save();

    // Update WalletTransaction to approved
    // const transaction = await WalletTransaction.findOne({
    //   user: user._id,
    //   type: "withdrawal to Bank",
    //   amount: amount,
    //   status: "pending",
    // }).sort({ createdAt: -1 });

    // if (transaction) {
    //   transaction.status = "approved";
    //   await transaction.save();
    // }
  }

  // Update withdrawal status
  request.status = newStatus;
  await request.save();

  return request;
};
