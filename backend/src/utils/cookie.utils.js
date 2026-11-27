const envConfig = require("../configs/env.config");

const serverCookie = {
  set: (res, key, value) => {
    return res.cookie(key, value, {
      maxAge: 900000, // 15 minutes in milliseconds
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: envConfig.NODE_ENV === "development" ? false : true, // Set to true in production (requires HTTPS)
      sameSite: "lax", // Protects against CSRF
    });
  },
  get: (req, key) => {
    const value = req.cookies[key];
    return value;
  },
  remove: (res, key) => {
    res.clearCookie(key);
  }
};

module.exports = serverCookie;
