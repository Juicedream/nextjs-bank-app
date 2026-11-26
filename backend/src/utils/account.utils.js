const generateSavingsAccountNumber = () => {
  const elevenDigits =
    "2" + String(Math.floor(Math.random() * 9000000000) + 1000000000);
  return Number(elevenDigits);
};

module.exports = {
  generateSavingsAccountNumber,
};
