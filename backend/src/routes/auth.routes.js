const {Router} = require("express");
const authController = require("../controllers/auth.controller");
const accessTokenUserMiddleware = require("../middlewares/accessToken.user.middleware");

const authRouter = Router();


authRouter
  .post("/login", authController.login)
  .post("/forgot-password", authController.forgotPassword)
  .post("/reset-password", authController.passwordReset)
  .post("/refresh-access-token", accessTokenUserMiddleware ,authController.getNewAccessToken)
  .post("/logout", accessTokenUserMiddleware, authController.logout)
  .get("/me", accessTokenUserMiddleware, authController.me)



module.exports = authRouter;