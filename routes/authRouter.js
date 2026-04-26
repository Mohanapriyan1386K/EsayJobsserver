const { login } = require("../Controller/Auth.controller");
const {verifyEmail} =require("../Controller/User.controller")
const express = require("express");
const router = express.Router();

router.post("/login", login);
router.get("/verify-email", verifyEmail);

module.exports = router;
