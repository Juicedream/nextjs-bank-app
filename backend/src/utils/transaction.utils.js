const cryto = require("crypto");

const generateTranRef = () => {
  const randomHex = cryto.randomBytes(8).toString("hex");
  return `TRNX-${randomHex}`;
};

module.exports = {
  generateTranRef,
};
