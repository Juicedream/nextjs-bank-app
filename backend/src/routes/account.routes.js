const {Router} = require("express");
const accountController = require("../controllers/account.controller");

const accountRouter = Router();

accountRouter
.get("/", accountController.getAllAccounts)
.get("/number/:accountNumber", accountController.getAccountByAccountNumber) // using query parameters;
.get("/:userId", accountController.getAccountsByUserId)

accountRouter.post("/", accountController.createAccount)


module.exports = accountRouter;