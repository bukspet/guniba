const { Product, Review } = require("../models/Product");

const ReviewService = {
  // Create a review
  async createReview({ userId, productId, variantId, rating, comment }) {
    const review = new Review({
      userId,
      productId,
      variantId,
      rating,
      comment,
    });
    await review.save();

    // Add review to product
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });

    return review;
  },

  // Update a review
  async updateReview(reviewId, userId, updateData) {
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, userId }, // Ensure the review belongs to the user
      updateData,
      { new: true } // Return updated document
    );

    if (!review) {
      throw new Error("Review not found or unauthorized");
    }

    return review;
  },

  // Delete a review
  async deleteReview(reviewId, userId) {
    const review = await Review.findOneAndDelete({ _id: reviewId, userId });

    if (!review) {
      throw new Error("Review not found or unauthorized");
    }

    // Remove review from product
    await Product.findByIdAndUpdate(review.productId, {
      $pull: { reviews: reviewId },
    });

    return;
  },
};

module.exports = ReviewService;
