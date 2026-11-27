const db = require("../db/index");

const transactionService = {

  async allTransactions(){
    return await db.Transaction.find().exec();
  },

  async transactionById(id) {
    const transaction = await db.Transaction.findById(id).exec();
    if (!transaction) return {error: "Transaction not found", code: 404};

    return {transaction};
  },

  async transactionByRef(ref) {
    const transaction = await db.Transaction.findOne({ref}).exec();
    if (!transaction) return {error: "Transaction not found", code: 404};

    return {transaction};
  },

  async create(data) {
    const transactionExists = await db.Transaction.findOne({
      idempotencyKey: data.idempotencyKey,
    });

    if (transactionExists && transactionExists.status === "pending") {
      return {error: "Duplicate transaction, There is an ongoing transaction in progress!"}
    }
   
    // Create new transaction
    const newTransaction = await db.Transaction.create({
      ref: data.ref,
      senderName: data.senderName,
      senderAccountNumber: data.senderAccountNumber,
      receiverName: data.receiverName,
      receiverAccountNumber: data.receiverAccountNumber,
      tranAmount: data.tranAmount,
      idempotencyKey: data.idempotencyKey,
    });

    return newTransaction;
  },

  async update(ref, data) {
    const transactions = await db.Transaction.find({
      ref
    });
    if (transactions.length < 1) {
      return {error: "No transaction found"}
    }

    const updatedTransactions = await db.Transaction.updateMany({
      ref,
    }, {status: data.status});

    return updatedTransactions;
  },

  async allUserTransactionsByAccountNumber(accountNumber) {
    const receiverTransactions = await db.Transaction.find({
      receiverAccountNumber: Number(accountNumber),
    });

    const senderTransactions = await db.Transaction.find({
      senderAccountNumber: Number(accountNumber),
    });

    const allTransactions = [
      ...receiverTransactions,
      ...senderTransactions,
    ];

    return allTransactions;
  }
}

module.exports = transactionService;