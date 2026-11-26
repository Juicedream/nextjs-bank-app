const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  ref: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required:true,
  },
  senderAccountNumber: {
    type: Number,
    required: true,
  },
  receiverName: {
    type: String,
    required:true,
  },
  receiverAccountNumber: {
    type: Number,
    required: true,
  },
  tranAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  idempotencyKey: {
    type: String,
    required: true,
  }
}, {timestamps: true});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;