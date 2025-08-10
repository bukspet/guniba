const payoutCardService = require("../services/payoutcardService");

exports.createPayoutCard = async (req, res) => {
  try {
    const { accountName, accountNumber, bank, isDefault } = req.body;

    // Validation: check required fields but allow isDefault to be false
    if (
      !accountName ||
      !accountNumber ||
      !bank ||
      typeof isDefault !== "boolean"
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const card = await payoutCardService.createPayoutCard({
      accountName,
      accountNumber,
      bank,
      user: req.user._id,
      isDefault,
    });

    return res.status(201).json(card);
  } catch (err) {
    console.error("Error creating payout card:", err.message);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};

exports.updatePayoutCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountName, accountNumber, bank, isDefault } = req.body;

    // Ensure at least one field is being updated
    if (
      !accountName &&
      !accountNumber &&
      !bank &&
      typeof isDefault !== "boolean"
    ) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const card = await payoutCardService.updatePayoutCard(
      id,
      { accountName, accountNumber, bank, isDefault },
      req.user._id
    );

    if (!card) {
      return res.status(404).json({ error: "Payout card not found." });
    }

    return res.status(200).json(card);
  } catch (err) {
    console.error("Error updating payout card:", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};

exports.deletePayoutCard = async (req, res) => {
  try {
    await payoutCardService.deletePayoutCard(req.params.id);
    res.json({ message: "Payout card deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPayoutCardById = async (req, res) => {
  try {
    const card = await payoutCardService.getPayoutCardById(req.params.id);
    if (!card) return res.status(404).json({ error: "Payout card not found" });
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserPayoutCards = async (req, res) => {
  try {
    const cards = await payoutCardService.getUserPayoutCards(req.user._id);
    res.json(cards);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllPayoutCards = async (req, res) => {
  try {
    const cards = await payoutCardService.getAllPayoutCards();
    res.json(cards);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
