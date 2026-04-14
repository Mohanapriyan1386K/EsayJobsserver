const { login } = require("../Controller/Auth.controller");
const express = require("express");
const router = express.Router();

router.post("/login", login);

module.exports = router;
