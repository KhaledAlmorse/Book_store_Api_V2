const slugify = require("slugify");
const { check } = require("express-validator");

const validatorMiddlware = require("../../middlewares/validatorMiddlware");

const User = require("../../Model/userModel");

exports.singupValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name Required.")
    .isLength({ max: 20 })
    .withMessage("Too Long User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email Required.")
    .isEmail()
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user) {
        return Promise.reject(
          new Error("This Email is Usable..Please Enter another Email")
        );
      }
    }),

  check("password")
    .notEmpty()
    .withMessage("Password Required.")
    .isLength({ min: 6 })
    .withMessage("Too short password")

    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password Confirm Required.."),

  check("phone")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone Number"),

  validatorMiddlware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email Required.")
    .isEmail()
    .withMessage("inavlid emaill address"),

  check("password")
    .notEmpty()
    .withMessage("Password Required.")
    .isLength({ min: 6 })
    .withMessage("Too short password"),
  validatorMiddlware,
];
