const express = require("express");

const {
  singup,
  login,
  forgotPassword,
  verifiyResetCode,
  resetPassword,
} = require("../Servises/authService");

const {
  singupValidator,
  loginValidator,
} = require("../utils/Validator/authValidator");

const router = express.Router();

router.route("/singup").post(singupValidator, singup);
router.route("/login").post(login, loginValidator);
router.route("/forgotpassword").post(forgotPassword);
router.route("/verifiypassword").post(verifiyResetCode);
router.route("/resetpassword").put(resetPassword);

module.exports = router;
