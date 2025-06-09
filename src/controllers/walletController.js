const walletService = require("../services/walletService");

exports.getWallet = async (req, res) => {
  try {
    const { wallet, transactions } = await walletService.getUserWallet(
      req.params.userId
    );
    res.json({ wallet, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveTransaction = async (req, res) => {
  try {
    const transaction = await walletService.approveWalletTransaction(
      req.params.transactionId
    );
    res.json({
      message: "Transaction approved and wallet updated",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
