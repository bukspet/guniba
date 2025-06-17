const express = require("express");
const router = express.Router();
const payoutCardController = require("../controllers/payoutcardController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, payoutCardController.createPayoutCard);
router.put("/:id", authMiddleware, payoutCardController.updatePayoutCard);
router.delete("/:id", authMiddleware, payoutCardController.deletePayoutCard);
router.get("/mine", authMiddleware, payoutCardController.getUserPayoutCards);
router.get("/:id", authMiddleware, payoutCardController.getPayoutCardById);
router.get("/", authMiddleware, payoutCardController.getAllPayoutCards); // optionally admin-only

module.exports = router;
