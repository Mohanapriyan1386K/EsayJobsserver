const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const token = Jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return token
};
