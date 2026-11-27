const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
const {
  catchAllErrorsMiddleware,
} = require("./middlewares/error.handler.middleware");
const userRouter = require("./routes/user.routes");
const ninRouter = require("./routes/nin.routes");
const successResponse = require("./middlewares/success.response.handler");
const accountRouter = require("./routes/account.routes");
const swaggerFile = require("../swagger-output.json");
const transactionRouter = require("./routes/transaction.routes");
const authRouter = require("./routes/auth.routes");

const app = express();

// Initialization
app.use(express.json()) // Read request body and converts to json
app.use(cookieParser()) // Read cookies e.g accessToken

// Swagger Intialization
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));


// General endpoint
app.get("/", (_, res) => {
       // #swagger.tags = ['App']
    // #swagger.summary = 'Home'
    // #swagger.description = 'Home'
  res.send("This is the Bank Server api")
});

// Health enpoint
app.get("/health", (_, res) =>
 { 
    // #swagger.tags = ['App']
    // #swagger.summary = 'Health'
    // #swagger.description = 'Shows app health'
  successResponse(
    res,
    `Server is okay now at ${new Date().toISOString()}`,
    200,
  )}
);


// All routes
app.use("/api/users", userRouter);
app.use("/api/nins", ninRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/auth", authRouter);

// Error handler middleware - Catch all errors in our app
app.use(catchAllErrorsMiddleware);

module.exports = app;
