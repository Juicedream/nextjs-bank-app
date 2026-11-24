const express = require("express");

const app = express();

// General endpoint
app.get("/", (_, res) => res.send("This is the Bank Server api"));

// Health enpoint
app.get("/health", (req, res) =>
  res
    .status(200)
    .json({
      message: "Server is okay.",
      status: "success",
      path: req.url,
      timestamp: new Date().toISOString(),
    }),
);

module.exports = app;
