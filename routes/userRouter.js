const express = require("express");
const router = express.Router();
const { createUser } = require("../Controller/User.controller");
const { getAllUsers } = require("../Controller/User.controller");
const { getUserPosts } = require("../Controller/User.controller");
const { deleteUser } = require("../Controller/User.controller");
const authMiddleware = require("../midlleware/authMiddleware");
router.post("/create", createUser);
router.get("/all",authMiddleware,getAllUsers);
router.get("/:userId/posts", getUserPosts);
router.delete("/:userId", deleteUser);
module.exports = router;

