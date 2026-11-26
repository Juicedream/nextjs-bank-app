const {Router} = require("express");
const transactionController = require("../controllers/transaction.controller");

const transactionRouter = Router();

transactionRouter
  .get("/", transactionController.getAllTransactions)
  .get("/account-number/:accountNumber", transactionController.getTransactionByAccountNumber)
  .get("/id/:id", transactionController.getTransactionById)
  .get("/ref/:ref", transactionController.getTransactionByRef)

module.exports = transactionRouter;