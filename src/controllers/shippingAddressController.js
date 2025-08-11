const ShippingAddressService = require("../services/shippingAddressService");

class ShippingAddressController {
  async create(req, res) {
    try {
      const address = await ShippingAddressService.createAddress(
        req.user._id,
        req.body
      );
      res.status(201).json({ success: true, data: address });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } ////////////////

  async update(req, res) {
    try {
      const address = await ShippingAddressService.updateAddress(
        req.params.id,
        req.user._id,
        req.body
      );
      if (!address) {
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });
      }
      res.json({ success: true, data: address });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await ShippingAddressService.deleteAddress(
        req.params.id,
        req.user._id
      );
      if (!result) {
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });
      }
      res.json({ success: true, message: "Address deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const addresses = await ShippingAddressService.getAllAddresses(
        req.user._id
      );
      res.json({ success: true, data: addresses });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const address = await ShippingAddressService.getAddressById(
        req.params.id,
        req.user._id
      );
      if (!address) {
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });
      }
      res.json({ success: true, data: address });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ShippingAddressController();
