const { Router } = require("express");
const ninController = require("../controllers/nin.controller");

const ninRouter = Router();

ninRouter
  .get("/", ninController.getAllNins)
  .get("/:nin", ninController.getNinByNinNumber);

ninRouter.post("/", ninController.createNinForUser);

module.exports = ninRouter;
