const bankApp = require("./app.js");
const connectToDatabase = require("./configs/db.config.js");
const ENV = require("./configs/env.config.js");

const PORT = ENV.PORT;
const API_URL = ENV.API_URL;

// Database connection
connectToDatabase();

// Server listen
bankApp.listen(PORT, () =>
  {
    console.log(
    `🖥️ Bank app api server listening on port: ${PORT} as ${API_URL}`,
  );
    console.log(
    `📚 Swagger Docs is running on : ${API_URL}/api-docs`,
  );
}
);
