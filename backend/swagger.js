const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });
const envConfig = require("./src/configs/env.config");

const doc = {
  info: {
    title: "Next Bank API Documentation",
    description: "This is the restapi for next bank",
    version: "1.0.0",
  },
  servers: [
    {
      url: envConfig.API_URL, // Development server
      description: envConfig.NODE_ENV === "development" ? "Development server" : "Production server" ,
    },
  ],
  tags: [
    { name: "App", description: "App endpoints" },
    { name: "Auth", description: "Auth endpoints" },
    { name: "Users", description: "Users endpoints" },
    { name: "Nins", description: "Nins endpoints" },
    { name: "Accounts", description: "Accounts endpoints" },
    { name: "Transactions", description: "Transactions endpoints" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "./swagger-output.json";

// Paths to file containing all apis
const routes = ["./src/app.js"];

swaggerAutogen(outputFile, routes, doc);
