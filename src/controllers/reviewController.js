const reviewService = require("../services/review.service");

exports.createReview = async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user._id, // assuming you have auth middleware setting req.user
    };
    const review = await reviewService.createReview(data);
    res.json({ success: true, data: review, message: "Review created" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviews();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.reviewId);
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};
exports.getReadyToReview = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have auth middleware setting req.user
    const items = await reviewService.getReadyToReviewForUser(userId);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
exports.updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(
      req.params.reviewId,
      req.body,
      req.user._id
    );
    res.json({ success: true, data: review, message: "Review updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.reviewId, req.user._id);
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
