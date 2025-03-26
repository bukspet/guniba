const User = require("../models/User.js");

class MLMService {
  async calculateCommission(userId, purchaseAmount) {
    const user = await User.findById(userId);
    if (!user) return;

    // Update user's total sales
    user.totalSales += purchaseAmount;
    await user.save();

    let referrerId = user.referredBy;
    let generation = 1;

    while (referrerId && generation <= 6) {
      const referrer = await User.findById(referrerId);
      if (!referrer) break;

      let commission = 0;
      if (generation === 1 && purchaseAmount >= 50) {
        commission = purchaseAmount * 0.05; // 5% for direct referrals
      } else {
        const totalSales = await this.getTotalSales(referrer._id);
        if (this.qualifiesForGenerationBonus(generation, totalSales)) {
          const generationRate = [0, 0.05, 0.04, 0.03, 0.02, 0.01, 0.01];
          commission = purchaseAmount * generationRate[generation];
        }
      }

      referrer.commissionEarned += commission;
      await referrer.save();

      // Move up the referral tree
      referrerId = referrer.referredBy;
      generation++;
    }
  }

  async getTotalSales(userId) {
    const user = await User.findById(userId);
    if (!user) return 0;

    let totalSales = user.totalSales;
    const downlines = await User.find({ referredBy: userId });

    for (let downline of downlines) {
      totalSales += await this.getTotalSales(downline._id);
    }
    return totalSales;
  }

  qualifiesForGenerationBonus(generation, totalSales) {
    const salesRequirements = [0, 0, 6000, 7000, 8000, 9000, 10000];
    return totalSales >= salesRequirements[generation];
  }
}

module.exports = new MLMService();
