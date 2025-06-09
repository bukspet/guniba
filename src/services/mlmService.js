const User = require("../models/User.js");
const Commission = require("../models/Commission.js");
const Order = require("../models/Order.js");

class MLMService {
  async calculateCommission(userId, purchaseAmount, orderId) {
    const user = await User.findById(userId);
    if (!user) return;

    // Update user sales and level
    user.totalSales += purchaseAmount;
    user.level = this.determineLevel(user.totalSales);
    await user.save();

    let referrerId = user.referredBy;
    let generation = 1;

    while (referrerId && generation <= 7) {
      const referrer = await User.findById(referrerId);
      if (!referrer) break;

      let commission = 0;

      if (generation === 1 && purchaseAmount >= 50) {
        commission = purchaseAmount * 0.05;
      } else {
        const totalSales = await this.getTotalSales(referrer._id);
        if (this.qualifiesForGenerationBonus(generation, totalSales)) {
          const generationRate = [0, 0.05, 0.04, 0.03, 0.02, 0.01, 0.01];
          commission = purchaseAmount * generationRate[generation];
        }
      }

      // Update referrer earnings
      if (commission > 0) {
        referrer.commissionEarned += commission;
        await referrer.save();

        // Save commission record
        await Commission.create({
          recipient: referrer._id,
          fromUser: userId,
          orderId,
          generation,
          amount: commission,
        });
      }

      // Move up the tree
      referrerId = referrer.referredBy;
      generation++;
    }
  }

  determineLevel(sales) {
    if (sales >= 10000) return 3;
    if (sales >= 5000) return 2;
    return 1;
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
    return generation === 7 || totalSales >= salesRequirements[generation];
  }
}

module.exports = new MLMService();
