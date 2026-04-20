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
      enum:["non-it","it",],

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
    applyType: {
      type: String,
      enum: ["walk-in", "online","email"],
      required: true,
    },
    applyLink:{
      type:String,
    },
    applyEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
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
    content: {
      type: String,
      default: "",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    details: {
      companyName: { type: String, default: "" },
      interviewLocation: { type: String, default: "" },
      interviewTimings: { type: String, default: "" },
      interviewDate: { type: String, default: "" },
      jobRole: { type: String, default: "" },
      salaryInfo: { type: String, default: "" },
      graduation: { type: String, default: "" },
      yearOfPassout: { type: String, default: "" },
      vacancy: { type: String, default: "" },
      shift: { type: String, default: "" },
      shiftTimings: { type: String, default: "" },
      weeklyOff: { type: String, default: "" },
      note: { type: String, default: "" },
      bondAndAgreement: { type: String, default: "" },
      hrName: { type: String, default: "" },
      hrNumber: { type: String, default: "" },
      rounds: { type: String, default: "" },
      walkInInfo: { type: String, default: "" },
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
