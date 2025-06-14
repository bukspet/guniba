const ShippingAddress = require("../models/ShippingAddress");

class ShippingAddressService {
  async createAddress(userId, data) {
    if (data.isDefault) {
      await ShippingAddress.updateMany({ user: userId }, { isDefault: false });
    }
    const address = await ShippingAddress.create({ ...data, user: userId });
    return address;
  }

  async updateAddress(addressId, userId, data) {
    if (data.isDefault) {
      await ShippingAddress.updateMany({ user: userId }, { isDefault: false });
    }
    const updated = await ShippingAddress.findOneAndUpdate(
      { _id: addressId, user: userId },
      data,
      { new: true }
    );
    return updated;
  }

  async deleteAddress(addressId, userId) {
    return ShippingAddress.findOneAndDelete({ _id: addressId, user: userId });
  }

  async getAllAddresses(userId) {
    return ShippingAddress.find({ user: userId });
  }

  async getAddressById(addressId, userId) {
    return ShippingAddress.findOne({ _id: addressId, user: userId });
  }
}

module.exports = new ShippingAddressService();
