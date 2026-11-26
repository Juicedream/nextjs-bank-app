const { default: mongoose } = require("mongoose");
const db = require("../db/index");
const { generateSavingsAccountNumber } = require("../utils/account.utils");
const {
  hashPin,
  generateFourDigitPin,
  comparePins,
} = require("../utils/pin.utils");
const { generateTranRef } = require("../utils/transaction.utils");
const ninService = require("./nin.service");
const transactionService = require("./transaction.service");
const userService = require("./user.service");

class AccountService {
  // Services
  #userService = userService;
  #ninService = ninService;
  #transactionService = transactionService;

  async #findAccountById(id) {
    const account = await db.Account.findById(id).populate(
      "transactions",
    ).lean();
    if (!account) return null;
    // const {passwordHash, ...rest}
    return account;
  }

  async allAccounts() {
    const accounts = await db.Account.find({})
    .populate("transactions")
    .lean();
    return accounts;
  }

  async allAccountsWithUserId(userId) {
    const accounts = await db.Account.find({ userId }).populate(
      "transactions",
    );
    return accounts;
  }

  async findAccountByAccountNumber(accountNumber) {
    const account = await db.Account.findOne({
      accountNumber: Number(accountNumber),
    }).populate("transactions");
    if (!account) return {error: "Account not found", code: 404};

    return {account};
  }

  async updateAccount(accountNumber, data) {
    const account = await this.findAccountByAccountNumber(accountNumber);
    if (!account) return null;

    let pinHash;

    if (data.pin && data.pin.length === 4) {
      pinHash = await hashPin(data.pin);
    }

    const updatedAccount = await db.Account.findByIdAndUpdate(account._id, {
      pinHash: pinHash ? pinHash : account.pinHash,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      transactions:
        data.transactions && data.transactions.length > 0
          ? [...account.transactions, ...data.transactions]
          : [...account.transactions],
      dailyLimit: data.level
        ? data.level === "tier 1"
          ? 100000
          : data.level === "tier 2"
            ? 200000
            : data.level === "tier 3"
              ? 300000
              : 100000
        : account.dailyLimit,
      isActive: data.isActive ? data.isActive : account.isActive,
    });

    return updatedAccount;
  }

  async updateAccountBalance(
    accountNumber,
    amount,
    transactionType,
    transactionId,
    session,
  ) {
    const account = await this.findAccountByAccountNumber(accountNumber);
    if (!account) return null;

    const transactionAmount = Number(amount);

    if (transactionType === "debit") {
      account.balance -= transactionAmount;
    } else if (transactionType === "credit") {
      account.balance += transactionAmount;
    } else {
      return null;
    }

    (await account.save()).$session(session);

    return await this.updateAccount(accountNumber, {
      transactions: [transactionId],
    });
  }

  async create(nin, session) {
    const foundNin = await this.#ninService.findNinByNumber(nin);
    if (foundNin.error) return {error: foundNin.error, code: 404};
    const existingNin = foundNin.userNin;
    const user = await this.#userService.findUserByEmail(existingNin.email);
    
    if (!user) return {error: "User not found", code: 404};

    if (!user.passwordHash) return {error: "Kindly create a password before you continue", code: 401}

    if (user.accountLimit >= 3) {
      return { error: "You have reached your account creation limit", code: 401 };
    }

    const accountName =
      existingNin.firstName && existingNin.middleName && existingNin.lastName
        ? `${existingNin.firstName} ${existingNin.middleName} ${existingNin.lastName}`
        : `${existingNin.firstName} ${existingNin.lastName}`;

    const accountNumber = generateSavingsAccountNumber();
    const accountManager = await this.#userService.randomManagerAccountId();
    const pin = generateFourDigitPin();
    const pinHash = await hashPin(pin);

    // Creating account
    const [newAccount] = await db.Account.create(
      [{
        userId: user._id,
        accountName,
        accountNumber,
        accountManager,
        pinHash,
      }],
      { session },
    );

    await this.#userService.updateUser(user._id, {
      accountLimit: user.accountLimit + 1,
      accounts: [...user.accounts, newAccount._id],
    });
   

    console.log("Created account for user, Here is the pin", pin);
    return { newAccount, userEmail: existingNin.email, accountPin: pin };
  }

  async delete(accountNumber) {
    const account = await this.findAccountByAccountNumber(accountNumber);

    const user = await this.#userService.findUserById(account.userId);

    await this.#userService.deleteUserAccount(user._id, account._id);

    await db.Account.findByIdAndDelete(account._id);

    // const deletedTransactions =

    return { deleted: true };
  }

  async transfer(data) {
    const senderAccount = await this.findAccountByAccountNumber(
      data.senderAccountNumber,
    );
    if (!senderAccount) return { error: "Sender Account Not Found!" };
    const receiverAccount = await this.findAccountByAccountNumber(
      data.receiverAccountNumber,
    );
    if (!receiverAccount) return { error: "Receiver Account Not Found!" };

    // Check sender pin
    const doesPinsMatch = await comparePins(data.pin, senderAccount.pinHash);
    if (!doesPinsMatch) return { error: "Invalid Pin provided!" };

    const tranAmount = Number(data.tranAmount);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (tranAmount > senderAccount.balance)
        return { error: "Insufficient funds!" };

      if (senderAccount.balance - tranAmount < 0)
        return { error: "Balance can't remain as negative value!" };

      if (tranAmount > senderAccount.dailyLimit)
        return {
          error:
            "Amount should not be greater than the dailylimit: " +
            senderAccount.dailyLimit,
        };

      const tranRef = generateTranRef();

      senderAccount.balance -= tranAmount;

      const newTransaction = {
        ref: tranRef,
        senderName: senderAccount.accountName,
        senderAccountNumber: senderAccount.accountNumber,
        receiverName: receiverAccount.accountName,
        receiverAccountNumber: receiverAccount.accountNumber,
        tranAmount,
        idempotencyKey: data.idempotencyKey,
      };

      const transaction = await this.#transactionService.create(newTransaction);

      (await senderAccount.save()).$session(session);

      this.#creditReciever(
        receiverAccount.accountNumber,
        tranAmount,
        transaction._id,
        session,
      );

      return { message: "Transaction in progress" };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      console.log("Transfer error:", error);
      return { message: "Transaction failed" };
    }
  }

  async #creditReciever(receiverAccountNumber, amount, tranId, session) {
    const status = Math.round(Math.random()) > 0 ? "success" : "failed";

    const tranAmount = Number(amount);
    const transaction = await this.#transactionService.transactionById(tranId);

    if (status === "failed")
      return this.#refundSender(
        transaction.senderAccountNumber,
        tranAmount,
        tranId,
        session,
      );

    await this.updateAccountBalance(
      Number(receiverAccountNumber),
      tranAmount,
      "credit",
      tranId,
      session,
    );

    await this.#transactionService.update(transaction.ref, { status });

    console.log("Transaction compeleted successfully");

    await session.commitTransaction();

    return { message: "Transaction compeleted successfully!" };
  }

  async #refundSender(senderAccountNumber, amount, tranId, session) {
    const transaction = await this.#transactionService.transactionById(tranId);

    await this.updateAccountBalance(
      Number(senderAccountNumber),
      Number(amount),
      "credit",
      tranId,
      session,
    );
    await this.#transactionService.update(transaction.ref, {
      status: "failed",
    });

    console.log("Sender refunded successfully");
    return { message: "Sender refunded successfully!" };
  }
}

module.exports = new AccountService();
