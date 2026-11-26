const mongoose = require("mongoose");
const transactionService = require("../services/transaction.service");
const successResponse = require("../middlewares/success.response.handler");
const { throwError } = require("../middlewares/error.handler.middleware");

const TransactionController = {
  async getAllTransactions(_, res) {
    // #swagger.tags = ['Transactions']
    // #swagger.summary = 'Get all transactions'
    // #swagger.description = 'Get all transactions'
    const transactions = await transactionService.allTransactions();
    return successResponse(res, "All Transactions", 200, { transactions });
  },

  async getTransactionById(req, res, next) {
    // #swagger.tags = ['Transactions']
    // #swagger.summary = 'Get transaction by id'
    // #swagger.description = 'Get transaction by id'
    const { id } = req.params;
  
    if (!id || !mongoose.isValidObjectId(id))
      return next(throwError("Please provide a valid id", 400));
    const { transaction, error, code } =
      await transactionService.transactionById(id);
    if (error) return next(throwError(error, code));
    return successResponse(res, "Transaction found", 200, { transaction });
  },

  async getTransactionByRef(req, res, next) {
    // #swagger.tags = ['Transactions']
    // #swagger.summary = 'Get transaction by ref'
    // #swagger.description = 'Get transaction by ref'
    const { ref } = req.params;
    if (!ref) return next(throwError("ref is required!", 400));
    const { transaction, error, code } =
      await transactionService.transactionByRef(ref);
    if (error) return next(throwError(error, code));
    return successResponse(res, "Transaction found", 200, { transaction });
  },

  async getTransactionByAccountNumber(req, res, next) {
    // #swagger.tags = ['Transactions']
    // #swagger.summary = 'Get transactions for accountNumber'
    // #swagger.description = 'Get transactions for accountNumber'

    let {accountNumber} = req.params;
    if (!accountNumber || isNaN(accountNumber)) return next(throwError("Please provide a valid account number", 400));
    accountNumber = Number(accountNumber);
    const transactions = await transactionService.allUserTransactionsByAccountNumber(accountNumber);
    return successResponse(res, "Transactions found", 200, {transactions});
  }
};

module.exports = TransactionController;
