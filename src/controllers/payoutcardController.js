const payoutCardService = require("../services/payoutcardService");

exports.createPayoutCard = async (req, res) => {
  try {
    const card = await payoutCardService.createPayoutCard({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePayoutCard = async (req, res) => {
  try {
    const card = await payoutCardService.updatePayoutCard(
      req.params.id,
      req.body
    );
    if (!card) return res.status(404).json({ error: "Payout card not found" });
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
