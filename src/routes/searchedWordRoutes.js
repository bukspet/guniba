const express = require("express");
const router = express.Router();
const searchedWordController = require("../controllers/searchedWordController");

router.post("/", searchedWordController.create);
router.delete("/:id", searchedWordController.delete);
router.get("/user", searchedWordController.getAllByUser);
router.get("/", searchedWordController.getAll);
router.get("/:id", searchedWordController.getOne);

module.exports = router;
