const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const envConfig = require("../configs/env.config");

const jwtService = {
  generateAccessToken(userId, role, email) {
    const payload = {
      sub: userId,
      role,
      email
    }
    const accessToken = jwt.sign(payload, envConfig.JWT_SECRET, {expiresIn: '15m'});
    return accessToken;
  },

  async hashAccessToken(accessTokenText) {
    return bcrypt.hash(accessTokenText, 12);
  },

  async compareAccessTokens(accessToken, hashedAccessToken) {
    return await bcrypt.compare(accessToken, hashedAccessToken);
  },



}

module.exports = jwtService;