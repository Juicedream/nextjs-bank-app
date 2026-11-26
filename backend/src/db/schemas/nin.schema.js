const mongoose = require("mongoose");
const { nigeriaStates } = require("../../common/constants.common");

const ninSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nin: {
      type: Number,
      length: [11, "NIN must be 11 digits"],
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    homeAddress: {
      type: String,
      requires: true,
    },
    profileImage: {
      type: String,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    stateOfOrigin: {
      type: String,
      enum: [...nigeriaStates],
      required: true,
    },
    country: {
      type: String,
      default: "Nigeria",
    },
  },
  { timestamps: true },
);

const Nin = mongoose.model("Nin", ninSchema);
module.exports = Nin;
