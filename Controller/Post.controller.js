const Post = require("../model/Post.model");
const User = require("../model/user.model");
const mongoose=require("mongoose")

const createPost = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Post content cannot be empty",
      });
    }

    if (Array.isArray(req.body)) {
      const posts = req.body;

      const invalidPost = posts.find(
        (p) =>
          !p.userId ||
          !p.type ||
          !p.title ||
          !p.company ||
          !p.salary ||
          !p.location ||
          !p.description||
          !p.applyLink
      );

      if (invalidPost) {
        return res.status(422).json({
          message: "All fields are required in each post",
        });
      }

      const createdPosts = await Post.insertMany(posts);

      return res.status(201).json({
        message: "Bulk Posts Created Successfully",
        count: createdPosts.length,
        posts: createdPosts,
      });
    }

    const {
      userId,
      jobtype,
      title,
      image,
      company,
      salary,
      location,
      description,
      applyLink
    } = req.body;

    if (
      !userId ||
      !jobtype ||
      !title ||
      !company ||
      !salary ||
      !location ||
      !description||
      !applyLink
    ) {
      return res.status(422).json({
        message: "All fields are required",
      });
    }

    const newPost = new Post({
      userId,
      jobtype,
      title,
      image,
      company,
      salary,
      location,
      description,
      applyLink,
    });

    await newPost.save();

    res.status(201).json({
      message: "Post Created Successfully",
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      title,
      company,
      type,
      fromDate,
      toDate,
      userId,
    } = req.query;

    // Convert to number
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const query = {};

    // Title filter
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Company filter
    if (company) {
      query.company = { $regex: company, $options: "i" };
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    if (fromDate || toDate) {
      query.updatedAt = {};

      if (fromDate) {
        query.updatedAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        // optional: include full day
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.updatedAt.$lte = endDate;
      }
    }

    const totalPosts = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 }) // sort by updatedAt
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      message: "Posts Retrieved Successfully",
      posts,
      pagination: {
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    res.status(200).json({
      message: "Post Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    if (!req.params.postId) {
      return res.status(400).json({
        message: "PostId is required in params",
      });
    }

    if (!req.body) {
      return res.status(400).json({
        message: "Post content cannot be empty",
      });
    }

    const { postId } = req.params;
    const {
      userId,
      jobtype,
      title,
      content,
      image,
      company,
      salary,
      location,
      comments,
      applyLink,
    } = req.body;
    console.log(userId, comments);
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { userId, title, content, image, jobtype,company, salary, location, comments,applyLink},
      { new: true },
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    res.status(200).json({
      message: "Post Updated Successfully",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;

    if (!postId || !userId || !text) {
      return res.status(400).json({
        message: "PostId, userId and comment text are required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = findUser.name;

    post.comments.push({
      userId,
      text,
      username,
    });

    await post.save();

    res.status(200).json({
      message: "Comment Added Successfully",
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({
        message: "PostId and UserId are required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? "Post unliked" : "Post liked",
      totalLikes: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  deletePost,
  updatePost,
  commentOnPost,
  likePost: toggleLike,
};
