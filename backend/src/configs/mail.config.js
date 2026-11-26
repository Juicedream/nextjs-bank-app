const nodemailer = require("nodemailer");
const envConfig = require("./env.config");


const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: envConfig.EMAIL_USER,
    pass: envConfig.EMAIL_PASS,
  },
});


module.exports = mailTransporter;
