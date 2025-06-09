const commissionService = require("../services/commissionService");

exports.getUserCommissions = async (req, res) => {
  try {
    const commissions = await commissionService.getUserCommissions(
      req.user._id
    );
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCommissionSummary = async (req, res) => {
  try {
    const total = await commissionService.getUserCommissionSummary(
      req.user._id
    );
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.transferCommissionToWallet = async (req, res) => {
  try {
    const result = await commissionService.transferCommissionToWallet(
      req.user._id
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.withdrawCommissionToBank = async (req, res) => {
  try {
    const { amount, payoutCardId } = req.body;
    if (!amount || !payoutCardId)
      return res.status(400).json({ error: "Missing required fields" });

    const withdrawal = await commissionService.withdrawCommissionToBank(
      req.user._id,
      amount,
      payoutCardId
    );
    res.status(201).json(withdrawal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
