const { isValidObjectId, default: mongoose } = require("mongoose");
const successResponse = require("../middlewares/success.response.handler");
const accountService = require("../services/account.service");
const { throwError } = require("../middlewares/error.handler.middleware");
const mailService = require("../services/mail.service");

const accountController = {
  async getAllAccounts(_, res) {
    // #swagger.tags = ['Accounts']
    // #swagger.summary = 'Get all accounts'
    // #swagger.description = 'Get all accounts'
    const accounts = await accountService.allAccounts();
    return successResponse(res, "All accounts", 200, {accounts});
  },
  async getAccountsByUserId(req, res, next) {
     // #swagger.tags = ['Accounts']
    // #swagger.summary = 'Get all user accounts by user id'
    // #swagger.description = 'Get all user accounts by user id'
    const {userId} = req.params;
    if (!isValidObjectId(userId)) return next(throwError("Invalid user id provided!", 400));
    try {
      const accounts = await accountService.allAccountsWithUserId(userId);
      return successResponse(res, "Accounts found", 200, {accounts});
    } catch (err) {
      console.log("Error occurred fetching accounts by user id", err);
      return next(throwError("Unable to get account by id, please try again"));
    }
  },
  async getAccountByAccountNumber(req, res, next) {
     // #swagger.tags = ['Accounts']
    // #swagger.summary = 'Get account by account number'
    // #swagger.description = 'Get account by account number'
    let {accountNumber} = req.params;
    if (isNaN(accountNumber) || accountNumber.length < 11 || accountNumber.length > 11) return next(throwError("Invalid account number!", 400));
    accountNumber = Number(accountNumber);

    try{
    const {account, error, code} = await accountService.findAccountByAccountNumber(accountNumber);
    if (error) return next(throwError(error, code));
    return successResponse(res, "Account found", 200, account);
    } catch (err) {
      const errorMessage = "Unable to get account by account number, please try again";
      console.log(errorMessage, err);
      return next(throwError(errorMessage));
      
    }
  },
  async createAccount(req, res, next) {
     // #swagger.tags = ['Accounts']
    // #swagger.summary = 'Create account for a user'
    // #swagger.description = 'Create account for a user'
    const {nin} = req.body;

    if (!nin) return next(throwError("Nin is required!", 400));
    if (nin.length > 11 || nin.length < 11 || isNaN(nin)) return next(throwError("Invalid Nin!", 200));

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {error, code, newAccount, userEmail, accountPin} = await accountService.create(nin, session);
      if (error) return next(throwError(error, code));
      await session.commitTransaction();
      //Send mail for account creation
       await mailService.send.accountCreationMail(
        userEmail,
        `
          <p>Dear <b>${newAccount.accountName}</b>,</p>
          <p>Your account has been created successfully!</p>
          <p>Account Number: <b>${newAccount.accountNumber}</b></p>
          <p>Account Pin: <b>${accountPin}</b></p>
          <p>Account Type: <b>${newAccount.type.charAt(0).toUpperCase() + newAccount.type.slice(1)}</b></p>
          <br>
          <br>
          <p>If you did not initiate this. kindly reach out to admin@nextbank.com</p>
          <p>Made with ❤️ by Next Bank &copy; ${new Date().getFullYear()}</p>
        `
       );
      return successResponse(res, "Account created successfully", 201, {account: newAccount});
    } catch (error) {
      await session.abortTransaction()
      session.endSession();
      console.log("Error occurred creating account", error);
      return next(throwError("Unable to create account, please try again", 400));
    }


  }
}


module.exports = accountController;