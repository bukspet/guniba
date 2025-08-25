// services/ReferralService.js
const User = require("../models/User.js");

class ReferralService {
  /**
   * Get referrals for a user
   * @param {string} userId
   * @returns {Array} referrals list
   */
  async getReferrals(userId) {
    const referrals = [];
    await this.findReferralsRecursive(userId, 1, referrals);
    return referrals;
  }

  async findReferralsRecursive(userId, generation, referrals) {
    const referredUsers = await User.find({ referredBy: userId });

    for (const user of referredUsers) {
      const invitedByUser = await User.findById(user.referredBy);

      referrals.push({
        name: user.fullName,
        email: user.email,
        dateJoined: user.createdAt,
        generation,
        invitedBy: invitedByUser
          ? {
              name: invitedByUser.fullName,
              email: invitedByUser.email,
              avatar: invitedByUser.avatar,
            }
          : null,
        status: user.status || "Active", // adjust if you have a different status logic
      });

      if (generation < 7) {
        await this.findReferralsRecursive(user._id, generation + 1, referrals);
      }
    }
  }
}

module.exports = new ReferralService();
