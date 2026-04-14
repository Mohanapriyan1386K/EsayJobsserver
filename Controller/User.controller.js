const User = require("../model/user.model");

const Post = require("../model/post.model");

const bcrypt = require("bcrypt");

//Create User
const createUser = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message: "User content cannot be empty",
    });
  }
  try {
    const {name,email,password} = req.body;

    console.log(name,email,password);

    const missingfiled = !name
      ? "Name"
      : !email
        ? "Email"
        : !password
          ? "Password"
          : null;
      

    const hashPassword = await bcrypt.hash(password, 10);

    
    if (missingfiled) {
      return res.status(422).json({
        message: ` ${missingfiled} Field Is Required `,
      });
    }
    const exitedUser = await User.find({ email });
    const isExisted = exitedUser.length > 0;
    if (isExisted) {
      return res.status(404).json({
        message: "Email is Allredy Exited",
      });
    }

    const newUser = new User({
      name,
      email,
      password:hashPassword,
    });

    await newUser.save();
    res.status(201).json({
      message: "User Created Successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
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
};
