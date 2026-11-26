const express = require("express");
const {
  catchAllErrorsMiddleware,
} = require("./middlewares/error.handler.middleware");
const userRouter = require("./routes/user.routes");
const ninRouter = require("./routes/nin.routes");
const successResponse = require("./middlewares/success.response.handler");
const accountRouter = require("./routes/account.routes");

const app = express();

// Initialization
app.use(express.json()) // Read request body and converts to json

// General endpoint
app.get("/", (_, res) => res.send("This is the Bank Server api"));

// Health enpoint
app.get("/health", (_, res) =>
  successResponse(
    res,
    `Server is okay now at ${new Date().toISOString()}`,
    200,
  ),
);

// All routes
app.use("/api/users", userRouter);
app.use("/api/nins", ninRouter);
app.use("/api/accounts", accountRouter);

// Error handler middleware - Catch all errors in our app
app.use(catchAllErrorsMiddleware);

module.exports = app;
