const { isValidObjectId } = require("mongoose");
const userService = require("../services/user.service");
const { throwError } = require("../middlewares/error.handler.middleware");
const successResponse = require("../middlewares/success.response.handler");

const userController = {
  async getAllUsers(req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get all users'
    // #swagger.description = 'Get all users'
    const users = await userService.findAllUsers();
    successResponse(res, "All Users", 200, { users });
  },

  async getUserById(req, res, next) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get user by id'
    // #swagger.description = 'Get user by id'
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(throwError("Invalid user id provided!", 400));
    }

    const { error, user } = await userService.findUserById(id);

    if (error) {
      return next(throwError(error, 404));
    }

    successResponse(res, "User Found!", 200, { user });
  },
  async updateUserInfo(req, res, next) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Update user by id'
    // #swagger.description = 'Update user by id'
    const { id } = req.params;
    const { ...data } = req.body;

    if (!isValidObjectId(id))
      return next(throwError("Invalid user id provided!", 400));

    const { error, user } = await userService.updateUser(id, data);
    if (error) return next(throwError(error, 404));

    return successResponse(res, "User updated successfully!", 200, { user });
  },

  async createPassword(req, res, next) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Create user password by id'
    // #swagger.description = 'Create user password by id'
    const { id } = req.params;
    const { password } = req.body;
    if (!isValidObjectId(id))
      return next(throwError("Invalid user id provided!", 400));

    // Prevent over-writing current password
    const existingUser = await userService.findUserById(id);
    if (existingUser.error) return next(throwError(existingUser.error, 404));

    if (existingUser.user.passwordHash)
      return next(throwError("Password already exists for this user", 401));

    if (!password) return next(throwError("Password is required!", 400));

    if (password.length < 8)
      return next(throwError("Password must be at least 8 characters", 400));

    const { error, user } = await userService.updateUser(id, { password });
    if (error) return next(throwError(error, 404));

    return successResponse(res, "Password created successfully!", 200, {
      user,
    });
  },
};

module.exports = userController;
