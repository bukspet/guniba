const User = require("../models/User");

class UserService {
  async getAllUsers() {
    return await User.find().select("-password"); // Exclude password field
  }

  async getUserById(userId) {
    return await User.findById(userId).select("-password");
  }

  async updateUser(userId, updateData) {
    const allowedFields = ["fullName", "email", "phone", "picture"];
    const filteredData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    return await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
    }).select("-password");
  }

  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = new UserService();
