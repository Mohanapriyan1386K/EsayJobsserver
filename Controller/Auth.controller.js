const Jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/user.model");

const login = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Login Data Empty",
      });
    }


   console.log(req.body)


    const { email, password } = req.body;

    const userExisted = await User.findOne({ email });
    if (!userExisted) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, userExisted.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const token = Jwt.sign(
      { id: userExisted._id, email: userExisted.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const userdata = userExisted.toObject();
    delete userdata.password;

    return res.status(200).json({
      message: "Login Successful",
      token,
      data: userdata,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { login };
