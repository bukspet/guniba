const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController.js");

router.get("/", UserController.listUsers);
router.get("/:id", UserController.getUserById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

module.exports = router;
