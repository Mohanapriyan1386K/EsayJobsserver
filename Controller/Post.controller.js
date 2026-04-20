const Post = require("../model/post.model");
const User = require("../model/user.model");
const mongoose = require("mongoose");

const normalizeApplyType = (value) => {
  if (!value) return value;
  const v = String(value).trim().toLowerCase();

  if (v === "walkin" || v === "walk-in" || v === "walk in") return "walk-in";
  if (v === "online") return "online";
  return v;
};

const mapPostPayload = (payload = {}, partial = false) => {
  const mapped = {};

  if (!partial || payload.userId !== undefined) mapped.userId = payload.userId;
  if (!partial || payload.jobtype !== undefined || payload.type !== undefined) {
    mapped.jobtype = payload.jobtype || payload.type;
  }
  if (!partial || payload.title !== undefined) mapped.title = payload.title;
  if (!partial || payload.image !== undefined) mapped.image = payload.image;
  if (!partial || payload.company !== undefined) mapped.company = payload.company;
  if (!partial || payload.salary !== undefined) mapped.salary = payload.salary;
  if (!partial || payload.location !== undefined) mapped.location = payload.location;
  if (!partial || payload.applyLink !== undefined) mapped.applyLink = payload.applyLink;
  if (!partial || payload.applyEmail !== undefined) mapped.applyEmail = payload.applyEmail;
  if (!partial || payload.applyType !== undefined || payload.applyMode !== undefined) {
    mapped.applyType = normalizeApplyType(payload.applyType || payload.applyMode);
  }

  if (!partial || payload.details !== undefined) mapped.details = payload.details || {};

  if (!partial || payload.content !== undefined || payload.description !== undefined) {
    const content = payload.content || payload.description || "";
    mapped.content = content;
    mapped.description = content;
  }

  return mapped;
};

const getRequiredFields = (postData) => {
  const requiredFields = [
    "userId",
    "jobtype",
    "title",
    "company",
    "salary",
    "location",
    "applyType",
    "content",
  ];

  return requiredFields.filter((field) => !postData[field]);
};

const getApplyTypeValidationError = (postData) => {
  if (!postData.applyType) return null;

  if (!["walk-in", "online"].includes(postData.applyType)) {
    return "applyType must be either 'walk-in' or 'online'";
  }

  if (postData.applyType === "online" && !postData.applyLink && !postData.applyEmail) {
    return "Either applyLink or applyEmail is required when applyType is 'online'";
  }

  if (postData.applyEmail) {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(postData.applyEmail);
    if (!isValidEmail) {
      return "applyEmail must be a valid email address";
    }
  }

  return null;
};

const createPost = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Post content cannot be empty",
      });
    }

    if (Array.isArray(req.body)) {
      const posts = req.body.map((post) => mapPostPayload(post));

      const invalidPost = posts.find((post) => getRequiredFields(post).length > 0);

      if (invalidPost) {
        return res.status(422).json({
          message: "Missing required fields in one or more posts",
          missingFields: getRequiredFields(invalidPost),
        });
      }

      const applyTypeErrorPost = posts.find((post) => getApplyTypeValidationError(post));
      if (applyTypeErrorPost) {
        return res.status(422).json({
          message: getApplyTypeValidationError(applyTypeErrorPost),
        });
      }

      const createdPosts = await Post.insertMany(posts);

      return res.status(201).json({
        message: "Bulk Posts Created Successfully",
        count: createdPosts.length,
        posts: createdPosts,
      });
    }

    const postData = mapPostPayload(req.body);
    const missingFields = getRequiredFields(postData);

    if (missingFields.length > 0) {
      return res.status(422).json({
        message: "Missing required fields",
        missingFields,
      });
    }

    const applyTypeError = getApplyTypeValidationError(postData);
    if (applyTypeError) {
      return res.status(422).json({ message: applyTypeError });
    }

    const newPost = new Post(postData);

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
      jobtype,
      applyType,
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
    if (jobtype || type) {
      query.jobtype = jobtype || type;
    }

    // Company filter
    if (company) {
      query.company = { $regex: company, $options: "i" };
    }

    if (applyType) {
      query.applyType = normalizeApplyType(applyType);
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
    const existingPost = await Post.findById(postId);

    if (!existingPost) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    const {
      userId,
      jobtype,
      title,
      content,
      description,
      image,
      company,
      salary,
      location,
      applyLink,
      applyEmail,
      applyType,
      details,
    } = req.body;

    const mappedData = mapPostPayload({
      userId,
      jobtype,
      title,
      content,
      description,
      image,
      company,
      salary,
      location,
      applyLink,
      applyEmail,
      applyType,
      details,
      applyMode: req.body.applyMode,
      type: req.body.type,
    }, true);

    const updateData = {};

    Object.keys(mappedData).forEach((key) => {
      if (mappedData[key] !== undefined) {
        updateData[key] = mappedData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided to update",
      });
    }

    const mergedForValidation = {
      ...existingPost.toObject(),
      ...updateData,
    };

    const applyTypeError = getApplyTypeValidationError(mergedForValidation);
    if (applyTypeError) {
      return res.status(422).json({ message: applyTypeError });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateData,
      { new: true, runValidators: true },
    );

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
    const { userId, email } = req.body;

    if (!postId || (!userId && !email)) {
      return res.status(400).json({
        message: "PostId and either userId or email are required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    let finalUserId = userId;

    if (!finalUserId && email) {
      const findUser = await User.findOne({ email: String(email).trim().toLowerCase() });
      if (!findUser) {
        return res.status(404).json({ message: "User not found for this email" });
      }
      finalUserId = findUser._id.toString();
    }

    if (!mongoose.Types.ObjectId.isValid(finalUserId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const isLiked = post.likes.some((id) => id.toString() === finalUserId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== finalUserId);
    } else {
      post.likes.push(finalUserId);
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
