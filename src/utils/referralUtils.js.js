const crypto = require("crypto");

function generateReferralCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Uppercase, lowercase, digits
  let code = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = crypto.randomInt(0, chars.length); // Get a random index
    code += chars[randomIndex]; // Append random character
  }

  return code;
}

module.exports = { generateReferralCode };

// console.log(generateReferralCode());
