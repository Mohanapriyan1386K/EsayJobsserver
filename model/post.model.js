const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // type: {
    //   type: String,
    //   enum: ["job", "blog", "post"],
    //   // required: true,
    // },

    jobtype:{
      type:String,
      enum:["it","government","core"],

    },

    // Common fields
    title: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    applyLink:{
      type:String,
    },

    // Job-specific fields
    company: {
      type: String,
      default: "",
    },
    salary: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      required:true,
    },

    // Social features
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        username:String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);