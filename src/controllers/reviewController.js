const ReviewService = require("../services/reviewService.js");

const ReviewController = {
  // Add a new review
  async addReview(req, res) {
    try {
      const { productId, variantId, rating, comment } = req.body;
      const userId = req.user._id; // User is already attached via authMiddleware

      const review = await ReviewService.createReview({
        userId,
        productId,
        variantId,
        rating,
        comment,
      });

      res.status(201).json({ success: true, message: "Review added", review });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Edit a review
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id;

      const updatedReview = await ReviewService.updateReview(reviewId, userId, {
        rating,
        comment,
      });

      res.json({ success: true, message: "Review updated", updatedReview });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete a review
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id;

      await ReviewService.deleteReview(reviewId, userId);

      res.json({ success: true, message: "Review deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = ReviewController;
