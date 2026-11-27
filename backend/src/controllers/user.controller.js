const { isValidObjectId } = require("mongoose");
const userService = require("../services/user.service");
const accountService = require("../services/account.service");
const ninService = require("../services/nin.service");
const { throwError } = require("../middlewares/error.handler.middleware");
const successResponse = require("../middlewares/success.response.handler");

const userController = {
  async getAllUsers(req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get all users'
    // #swagger.description = 'Get all users'
    const users = await userService.findAllUsers();
    return successResponse(res, "All Users", 200, { users });
  },

  async getUserById(req, res, next) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get user by id'
    // #swagger.description = 'Get user by id'
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(throwError("Invalid user id provided!", 400));
    }

    const { error, code, user } = await userService.findUserById(id);

    if (error) {
      return next(throwError(error, code));
    }

    return successResponse(res, "User Found!", 200, { user });
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
    if (existingUser.error) return next(throwError(existingUser.error, existingUser.code));

    if (existingUser.user.passwordHash)
      return next(throwError("Password already exists for this user", 401));

    if (!password) return next(throwError("Password is required!", 400));

    if (password.length < 8)
      return next(throwError("Password must be at least 8 characters", 400));

    const { error, user } = await userService.updateUser(id, { password });
    if (error) return next(throwError(error));

    return successResponse(res, "Password created successfully!", 200, {
      user,
    });
  },
  async deleteUser(req, res, next) {
     // #swagger.tags = ['Users']
    // #swagger.summary = 'Delete user by email'
    // #swagger.description = 'Delete user by email'
    let {email} = req.body;
    email = email.toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) return next(throwError("Please provide a valid email", 400));

    const user = await userService.findUserByEmail(email);
    if (!user) return next(throwError("User not found", 404));

    const { deleted, error } = await accountService.deleteAccountsByUserId(
      user._id,
    );
    if (!deleted) {
      return next(
        throwError(error || "Unable to delete user accounts", 500),
      );
    }

    await ninService.deleteNinByUserEmail(email);
    await userService.deleteUserById(user._id);

    return successResponse(res, "User Deleted Successfully", 204);
  },
};

module.exports = userController;
