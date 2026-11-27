const serverCookie = require("../utils/cookie.utils");
const { throwError } = require("./error.handler.middleware");
const jwt = require("jsonwebtoken");
const envConfig = require("../configs/env.config");

const accessTokenUserMiddleware = async (req, _, next) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader ? authHeader.split(" ")[1] : serverCookie.get(req, "accessToken");
  if (!accessToken) return next(throwError("Access token is missing", 401));
  // Verify accessToken 
    jwt.verify(accessToken, envConfig.JWT_SECRET, (err, decoded) => {
      if (err) return next(throwError("Invalid or expired token", 401));
      // If valid
      req.user = {_id: decoded.sub, role: decoded.role, email: decoded.email};
      req.accessToken = accessToken;
    });

    next();
}

module.exports = accessTokenUserMiddleware