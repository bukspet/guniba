const User = require("../models/User.js");
const Commission = require("../models/Commission.js");
const Order = require("../models/Order.js");

class MLMService {
  async calculateCommission(userId, purchaseAmount, orderId) {
    const user = await User.findById(userId);
    if (!user) return;

    // 1️⃣ Update the buyer’s total sales and level
    const sales = Number(purchaseAmount) || 0;
    user.totalSales += sales;
    user.level = this.determineLevel(user.totalSales);
    await user.save();

    // 2️⃣ Traverse the referral chain
    let referrerId = user.referredBy;
    let generation = 1;

    while (referrerId && generation <= 3) {
      const referrer = await User.findById(referrerId);
      if (!referrer) break;

      const commission = await this.calculateBonusForReferrer(
        referrer,
        purchaseAmount,
        generation
      );

      if (commission > 0) {
        referrer.commissionEarned += commission;
        referrer.commissionBalance += commission;
        await referrer.save();

        await Commission.create({
          recipient: referrer._id,
          fromUser: userId,
          orderId,
          generation,
          amount: commission,
        });
      }

      referrerId = referrer.referredBy;
      generation++;
    }
  }

  /**
   * Determine user level based on total sales
   */
  determineLevel(totalSales) {
    if (totalSales >= 50000) return 3;
    if (totalSales >= 5000) return 2;
    if (totalSales >= 25) return 1;
    return 1;
  }

  /**
   * Calculate referral commission based on generation and referrer level
   */
  async calculateBonusForReferrer(referrer, purchaseAmount, generation) {
    const totalSales = referrer.totalSales || 0;
    const level = this.determineLevel(totalSales);

    // Define bonus structures per level
    const bonusRates = {
      1: { minSales: 25, rates: [0.05] }, // Only 1st generation
      2: { minSales: 5000, rates: [0.05, 0.03] }, // 1st and 2nd
      3: { minSales: 50000, rates: [0.05, 0.03, 0.02] }, // 1st, 2nd, 3rd
    };

    const currentLevel = bonusRates[level];

    // Check eligibility
    if (totalSales < currentLevel.minSales) return 0;

    // Check if generation qualifies
    const rate = currentLevel.rates[generation - 1];
    return rate ? purchaseAmount * rate : 0;
  }
}

module.exports = new MLMService();
