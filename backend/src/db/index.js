const User = require("./schemas/user.schema");
const Nin = require("./schemas/nin.schema");
const Account = require("./schemas/account.schema");
const Transaction = require("./schemas/transaction.schema");

const db = {
  User,
  Nin,
  Account,
  Transaction,
};

module.exports = db;
