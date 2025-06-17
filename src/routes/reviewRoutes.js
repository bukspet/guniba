const express = require("express");
const ReviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Create a review
router.post("/", authMiddleware, ReviewController.createReviewController);

// Get all reviews
router.get("/", authMiddleware, ReviewController.getAllReviewsController);

// Get reviews user is ready to review
router.get(
  "/ready-to-review",
  authMiddleware,
  ReviewController.getReadyToReviewController
);

// Get a single review by ID
router.get(
  "/:reviewId",
  authMiddleware,
  ReviewController.getReviewByIdController
);

// Update a review by ID
router.put(
  "/:reviewId",
  authMiddleware,
  ReviewController.updateReviewController
);

// Delete a review by ID
router.delete(
  "/:reviewId",
  authMiddleware,
  ReviewController.deleteReviewController
);

module.exports = router;
