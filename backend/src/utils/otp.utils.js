const bcrypt = require("bcryptjs");

const otp = {
    generate: () => {
    return String(Math.floor(Math.random() * 900000) + 100000);
  },
  hash: async (otpCode) => {
    return await bcrypt.hash(otpCode, 12);
  },
  compareOtps: async (otpCode, hashedOtpCode) => {
    return await bcrypt.compare(otpCode, hashedOtpCode);
  }
}

module.exports = otp