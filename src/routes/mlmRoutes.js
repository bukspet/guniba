const express = require("express");
const mlmController = require("../controllers/mlmController");
const router = express.Router();

router.get("/downlines/:id", mlmController.getDownlines);

module.exports = router;
