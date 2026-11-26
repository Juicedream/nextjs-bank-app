const bcrypt = require("bcryptjs");

const hashPassword =  async (passwordText) => {
  return await bcrypt.hash(passwordText, 12);
}

const comparePasswords = async (passwordText, hashedPassword) => {
  return await bcrypt.compare(passwordText, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePasswords,
}