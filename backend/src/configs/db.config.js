const mongoose = require("mongoose");
const ENV = require("../configs/env.config");
const exit = require("node:process");

const connectToDatabase = async () => {
  console.log("🛜 Connecting to Database...");
  try {
    if (!ENV.MONGO_URI) {
      throw new error("Mongo uri value is missing from the .env");
    }
    await mongoose.connect(ENV.MONGO_URI);
    console.log("🟢 Databse is active and connected successfully.");
  } catch (error) {
    console.error(
      " 🔴 Database is not active and not connected successfully: ",
      error,
    );
    exit(1);
  }
};

module.exports = connectToDatabase;