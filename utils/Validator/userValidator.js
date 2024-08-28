const slugify = require("slugify");
const { check } = require("express-validator");
const bcrypt = require("bcrypt");

const validatorMiddlware = require("../../middlewares/validatorMiddlware");

const User = require("../../Model/userModel");

exports.createUserValidator = [
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
    .withMessage("Too Long password")
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

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User Id format"),
  validatorMiddlware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User Id format"),
  check("name").custom((val, { req }) => {
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
  check("phone")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone Number"),
  validatorMiddlware,
];

exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User Id format"),

  check("currentPassword")
    .notEmpty()
    .withMessage("Current Password Required.."),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password Confirm Required.."),

  check("password")
    .notEmpty()
    .withMessage("Password Required.")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error(`There is no user for this id:${req.params.id}`);
      }

      const isCorrectPass = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPass) {
        throw new Error(`Incorrect Current Password`);
      }

      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  validatorMiddlware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User Id format"),
  validatorMiddlware,
];

exports.updateLoggedUserValidator = [
  check("name").custom((val, { req }) => {
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
  check("phone")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone Number"),
  validatorMiddlware,
];
