const jwt = require("jsonwebtoken");

const createToken = (palyod) =>
  jwt.sign({ userId: palyod }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
module.exports = createToken;
