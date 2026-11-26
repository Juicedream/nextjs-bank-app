const mongoose = require("mongoose");
const { userRoles } = require("../../common/constants.common");

const userSchema = new mongoose.Schema(
  {
    ninId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nin",
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
    },
    otpHash: {
      type: String,
    },
    role: {
      type: String,
      enum: [...userRoles],
      default: "customer",
    },
    accountLimit: {
      type: Number,
      default: 0,
      max: 3,
    },
    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
