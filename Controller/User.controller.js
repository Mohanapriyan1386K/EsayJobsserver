const User = require("../model/user.model");

const Post = require("../model/post.model");

const bcrypt = require("bcrypt");
const {Resend} =require("resend");
const crypto = require("crypto");

const resend = new Resend(process.env.RESEND_API_KEY);

const makeUsernameBase = (name, email) => {
  const nameBase = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  if (nameBase) return nameBase;

  return String(email || "")
    .split("@")[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "") || "user";
};

const generateUniqueUsername = async (name, email) => {
  const base = makeUsernameBase(name, email);
  let candidate = base;
  let suffix = 0;

  while (await User.exists({ user_name: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return candidate;
};

const createUser = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message: "User content cannot be empty",
    });
  }

  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const missingfiled = !name
      ? "Name"
      : !email
      ? "Email"
      : !password
      ? "Password"
      : null;

    if (missingfiled) {
      return res.status(422).json({
        message: `${missingfiled} Field Is Required`,
      });
    }

    const exitedUser = await User.findOne({ email });

    if (exitedUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 3600000; // 1 hour
    const user_name = await generateUniqueUsername(name, email);

    const newUser = new User({
      name,
      email,
      user_name,
      password: hashPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    await newUser.save();

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      process.env.VITE_FRONTEND_URL ||
      "http://localhost:5173"
    ).replace(/\/+$/, "");

    const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${verifyLink}">Verify Email</a>
      `,
    });

    res.status(201).json({
      message: "User created. Please verify your email.",
    });

  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "User already exists",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({ success: false });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ success: true }); // ✅ NOT redirect
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "Users Retrieved Successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get posts by user
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      message: "User Posts Retrieved Successfully",
      posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User Not Found" });
    }  res.status(200).json({message: "User Deleted Successfully"});
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


module.exports = {
  createUser,
  getAllUsers,
  getUserPosts,
  deleteUser,
  verifyEmail
};
