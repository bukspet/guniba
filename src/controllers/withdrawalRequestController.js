const withdrawalRequestService = require("../services/withdrawalService");

exports.getAllWithdrawalRequestsController = async (req, res) => {
  try {
    const requests = await withdrawalRequestService.getAllWithdrawalRequests();
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserWithdrawalRequestsController = async (req, res) => {
  try {
    const { userId } = req.body;
    const requests = await withdrawalRequestService.getUserWithdrawalRequests(
      userId
    );
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateWithdrawalRequestStatusController = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const updatedRequest =
      await withdrawalRequestService.updateWithdrawalRequestStatus(
        requestId,
        status
      );
    res.json({
      success: true,
      data: updatedRequest,
      message: "Status updated",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
