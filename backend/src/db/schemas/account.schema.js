const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: Number,
      length: [11, "Account Number must be 11 digits"],
      required: true,
      unique: true,
    },
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinHash: {
      type: String,
      required: true,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["savings"],
      default: "savings",
    },
    level: {
      type: String,
      enum: ["tier 1", "tier 2", "tier 3"],
      default: "tier 1",
    },
    bank: {
      type: String,
      default: "Next Bank"
    },
    balance: {
      type: Number,
      default: 100,
    },
    dailyLimit: {
      type: Number,
      default: 100000,
    },
  },
  { timestamps: true },
);

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
