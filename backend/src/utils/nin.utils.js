const crypto = require("crypto");

const generateNinNumber = () => {
  const elevenDigits = crypto.randomInt(10000000000, 100000000000);
  return elevenDigits;
};


function getAge(dobString) {
  // 1. Split the "DD/MM/YYYY" string into numbers
  const [day, month, year] = dobString.split("/").map(Number);

  // 2. Create a Date object (Note: JavaScript months are 0-indexed, so subtract 1)
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  // 3. Calculate the base age by subtracting the years
  let age = today.getFullYear() - birthDate.getFullYear();

  // 4. Adjust if the birthday hasn't happened yet this year
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function isValidDateOfBirth(dateString) {
  // 1. Check the pattern: 2 digits / 2 digits / 4 digits
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  // 2. Extract the numbers
  const [day, month, year] = dateString.split("/").map(Number);

  // 3. Construct the Date object
  const date = new Date(year, month - 1, day);

  // 4. Verify the Date object didn't "roll over" (e.g., Feb 31 -> Mar 2)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

module.exports = {
  generateNinNumber,
  getAge,
  isValidDateOfBirth,
};
