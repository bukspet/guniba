const { Review, ReadyToReview } = require("../models/Product");

exports.createReview = async (data) => {
  const review = await Review.create(data);

  // Remove from ReadyToReview if exists
  await ReadyToReview.deleteOne({
    userId: review.userId,
    productId: review.productId,
    variantId: review.variantId || null,
  });

  return review;
};

exports.getReviews = async (filter = {}) => {
  return await Review.find(filter)
    .populate("userId", "fullName email")
    .populate("productId", "name")
    .populate("variantId", "name")
    .sort({ createdAt: -1 });
};

exports.getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate("userId", "fullName email")
    .populate("productId", "name")
    .populate("variantId", "name");
  if (!review) throw new Error("Review not found");
  return review;
};
exports.getReadyToReviewForUser = async (userId) => {
  const records = await ReadyToReview.find({ userId })
    .populate("productId", "name")
    .populate("variantId", "name")
    .populate("orderId", "status createdAt");

  return records;
};

exports.updateReview = async (reviewId, data, userId) => {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    data,
    { new: true }
  );
  if (!review) throw new Error("Review not found or unauthorized");
  return review;
};

exports.deleteReview = async (reviewId, userId) => {
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });
  if (!review) throw new Error("Review not found or unauthorized");
  return review;
};
