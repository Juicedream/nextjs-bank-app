const { default: mongoose } = require("mongoose");
const { nigeriaStates } = require("../common/constants.common");
const { throwError } = require("../middlewares/error.handler.middleware");
const successResponse = require("../middlewares/success.response.handler");
const ninService = require("../services/nin.service");
const { isValidDateOfBirth } = require("../utils/nin.utils");

const ninController = {
  async getAllNins(_, res) {
    const nins = await ninService.fetchAllNins();
    successResponse(res, "All Nins", 200, { nins });
  },
  async getNinByNinNumber(req, res, next) {
    const { nin } = req.params;
    if (isNaN(nin)) {
      return next(throwError("Invalid nin number", 400));
    }
    const ninNumber = Number(nin);
    const { userNin, error } = await ninService.findNinByNumber(ninNumber);
    if (error) return next(throwError(error, 404));
    return successResponse(res, "Nin found", 200, { nin: userNin });
  },
  async createNinForUser(req, res, next) {
    const {
      email,
      firstName,
      middleName,
      lastName,
      gender,
      phoneNumber,
      homeAddress,
      dateOfBirth,
      stateOfOrigin,
    } = req.body;

    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneNumberRegex = /^0\d{10}$/;

    if (
      !email ||
      !firstName ||
      !lastName ||
      !gender ||
      !phoneNumber ||
      !homeAddress ||
      !dateOfBirth ||
      !stateOfOrigin
    ) {
      return next(throwError("All fields are required", 400));
    }

    if (!emailRegex.test(email)) {
      return next(throwError("Invalid email address", 400));
    }

    if (!["male", "female"].includes(gender)) {
      return next(
        throwError("Invalid gender. Only male or female is allowed", 400),
      );
    }

    if (!isValidDateOfBirth(dateOfBirth)) {
      return next(
        throwError(
          "Invalid date of birth format, Valid format is DD/MM/YYYY",
          400,
        ),
      );
    }

    if (phoneNumber.length > 11 || phoneNumber.length < 11) {
      return next(throwError("Phone number must be 11 digits", 400));
    }

    if (!phoneNumber.startsWith("0")) {
      return next(throwError("Phone number must start with 0", 400));
    }

    if (!phoneNumberRegex.test(phoneNumber)) {
      return next(throwError("Invalid Phone number", 400));
    }

    if (!nigeriaStates.includes(stateOfOrigin.toLowerCase())) {
      return next(
        throwError(
          `Invalid state provided. Only the following states are allowed: ${nigeriaStates.join(", ")}`,
          400,
        ),
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { error, info, code } = await ninService.createNinUser(
        {
          email,
          firstName,
          middleName,
          lastName,
          gender,
          phoneNumber,
          homeAddress,
          dateOfBirth,
          stateOfOrigin,
        },
        session,
      );

      if (code === 409) {
        return next(throwError(error, code));
      }
      if (code === 400) {
        return next(throwError(error, code));
      }
      await session.commitTransaction();
      successResponse(res, "Nin created successfully", 201, { nin: info });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.log("Unable to create nin for user", error);
      return next(throwError("Unable to create nin at the moment"));
    }
  },
};

module.exports = ninController;
