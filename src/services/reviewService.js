const { Review, ReadyToReview } = require("../models/Product");

exports.createReview = async (data) => {
  const review = await Review.create(data);

  // push rating into product
  await Product.findByIdAndUpdate(
    review.productId,
    { $push: { rating: review.rating } },
    { new: true }
  );

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
    .populate("userId", "fullName email avatar")
    .populate("productId")
    .populate("variantId")
    .sort({ createdAt: -1 });
};

exports.getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate("userId", "fullName email avatar")
    .populate("productId")
    .populate("variantId");
  if (!review) throw new Error("Review not found");
  return review;
};
exports.getReadyToReviewForUser = async (userId) => {
  const records = await ReadyToReview.find({ userId })
    .sort({ createdAt: -1 })
    .populate("productId")
    .populate("variantId")
    .populate("orderId", "status createdAt");

  return records;
};

exports.updateReview = async (reviewId, data, userId) => {
  const oldReview = await Review.findOne({ _id: reviewId, userId });
  if (!oldReview) throw new Error("Review not found or unauthorized");

  // update review
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    data,
    { new: true }
  );

  if (data.rating && data.rating !== oldReview.rating) {
    // update product rating array
    const product = await Product.findById(review.productId);

    if (product) {
      // replace old rating with new
      const idx = product.rating.findIndex((r) => r === oldReview.rating);
      if (idx !== -1) {
        product.rating[idx] = data.rating;
        await product.save();
      }
    }
  }

  return review;
};

exports.deleteReview = async (reviewId, userId) => {
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });
  if (!review) throw new Error("Review not found or unauthorized");
  return review;
};
