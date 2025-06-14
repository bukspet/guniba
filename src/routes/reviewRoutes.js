const express = require("express");
const ReviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware"); // Ensure user authentication

const router = express.Router();

router.post("/", authMiddleware, ReviewController.addReview); // Add a review
router.put("/:reviewId", authMiddleware, ReviewController.updateReview); // Edit a review

router.get("/", auth, ReviewController.getReadyToReview);
router.delete("/:reviewId", authMiddleware, ReviewController.deleteReview); // Delete a review

module.exports = router;
