const bcrypt = require("bcryptjs");

const generateFourDigitPin = () => {
  const fourDigitsPin = Math.floor(Math.random() * 9000) + 1000;
  return fourDigitsPin.toString();
};

const hashPin = async (pinText) => await bcrypt.hash(pinText, 12);

const comparePins = async (pinText, hashedPin) =>
  await bcrypt.compare(pinText, hashedPin);

module.exports = {
  generateFourDigitPin,
  hashPin,
  comparePins,
};
