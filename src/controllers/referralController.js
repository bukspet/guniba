// controllers/ReferralController.js
const ReferralService = require("../services/referralService");

exports.getUserReferrals = async (req, res) => {
  try {
    const userId = req.params.userId;
    const referrals = await ReferralService.getReferrals(userId);

    return res.status(200).json({
      success: true,
      message: "Referrals fetched successfully",
      data: referrals,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error fetching referrals: ${err.message}`,
      data: null,
    });
  }
};
