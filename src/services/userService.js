const User = require("../models/User");

class UserService {
  async getAllUsers() {
    const users = await User.find({ role: "user" })
      .select(
        "fullName email phone status role level commissionEarned totalSales lastActivity createdAt referredBy"
      )
      .lean();

    const results = await Promise.all(
      users.map(async (user) => {
        const downlineCount = await User.countDocuments({
          referredBy: user._id,
        });
        return {
          ...user,
          directDownlines: downlineCount,
        };
      })
    );

    return results;
  }

  async getUserById(userId) {
    return await User.findById(userId).select("-password");
  }

  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");
    return user;
  }

  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = new UserService();
