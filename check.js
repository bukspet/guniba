const bcrypt = require("bcryptjs");

const plainPassword = "Peter123456@";
const hashedPassword =
  "$2b$10$WMDdBA/c/qlcv9WDE7zbhemiK9en0nVBSgYbAwUbty4rJz33Hr3dS"; // From DB

bcrypt.compare(plainPassword, hashedPassword).then((isMatch) => {
  console.log("Password Match:", isMatch); // Should print `true`
});
