const { Router } = require("express");
const userController = require("../controllers/user.controller");

const userRouter = Router();

userRouter
  .get("/", userController.getAllUsers)
  .get("/:id", userController.getUserById)

  .post("/create-password/:id", userController.createPassword)

  .patch("/:id", userController.updateUserInfo)

module.exports = userRouter;
