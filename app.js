const cors = require("cors");
const express = require("express");
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter");
const authRouter = require("./routes/authRouter");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/auth", authRouter);

module.exports = app;
