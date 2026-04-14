const cors = require("cors");
const express = require("express");
const connectDB = require("./Database/Db");
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter");
const authRouter = require("./routes/authRouter");
const app = express();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database Connection Error",
      error: error.message,
    });
  }
});

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/auth", authRouter);

module.exports = app;
