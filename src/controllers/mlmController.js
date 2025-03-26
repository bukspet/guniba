const mlmService = require("../services/mlmService");

class MLMController {
  async getDownlines(req, res) {
    try {
      const userId = req.params.id;
      const downlines = await mlmService.getDownlines(userId);
      res.json(downlines);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new MLMController();
