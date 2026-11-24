const bankApp = require("./app.js");
const ENV = require("./configs/env.config.js");

const PORT = ENV.PORT;
const API_URL = ENV.API_URL;

// Server listen
bankApp.listen(PORT, () =>
  console.log(
    `🖥️ Bank app api server listening on port: ${PORT} as ${API_URL}`,
  ),
);
