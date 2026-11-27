const dotenv = require("dotenv");

// Allows all .env variables to be read and used
dotenv.config();

const ENV = {
  PORT : parseInt(process.env.PORT) || 3000,
  
  API_URL : process.env.API_URL || "http://localhost:3000",

  MONGO_URI: process.env.MONGO_URI || "mongo+srv/localhost://",

  EMAIL_USER: process.env.EMAIL_USER || "some_email@example.com",

  EMAIL_PASS: process.env.EMAIL_PASS  || "some_app_password",
  
  JWT_SECRET: process.env.JWT_SECRET  || "some_secret",

  NODE_ENV: process.env.NODE_ENV || "development"
};

module.exports = ENV;