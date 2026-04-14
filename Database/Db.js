const mongoose = require("mongoose");

let cachedConnectionPromise = null;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not set");
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!cachedConnectionPromise) {
      cachedConnectionPromise = mongoose.connect(process.env.MONGO_URL);
    }

    await cachedConnectionPromise;
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    cachedConnectionPromise = null;
    throw error;
  }
};

module.exports = connectDB;
