const dotenv = require("dotenv");

// Allows all .env variables to be read and used
dotenv.config();

const ENV = {
  PORT : parseInt(process.env.PORT) || 3000,
  
  API_URL : process.env.API_URL || "http://localhost:3000",

  MONGO_URI: process.env.MONGO_URI || "mongo+srv/localhost://",
};

module.exports = ENV;