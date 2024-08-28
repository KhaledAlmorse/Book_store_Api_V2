const slugify = require("slugify");
const { check } = require("express-validator");

const validatorMiddlware = require("../../middlewares/validatorMiddlware");

const User = require("../../Model/userModel");
const Book = require("../../Model/bookModel");

exports.createBookValidator = [
  check("user")
    .isMongoId()
    .withMessage("Invalid Id Format")
    .custom(async (val, { req }) => {
      const user = await User.findById(val);
      if (!user) {
        return Promise.reject(new Error("The Book Must belong To User"));
      }
    }),
  check("name")
    .notEmpty()
    .withMessage("Name Required.")
    .custom(async (val, { req }) => {
      const book = await Book.findOne({ name: val });
      if (book) {
        return Promise.reject(new Error("The Book Name Must be Unique"));
      }
    }),

  check("title")
    .notEmpty()
    .withMessage("Title Required.")
    .isLength({ min: 50 })
    .withMessage("Too short Book title"),
  check("price").notEmpty().withMessage("Price Required.").isNumeric(),

  validatorMiddlware,
];

exports.getBookValidator = [
  check("id").isMongoId().withMessage("Invalid Book Id format"),
  validatorMiddlware,
];

exports.updateBookValidator = [
  check("id").isMongoId().withMessage("Invalid Book Id format"),
  validatorMiddlware,
];

exports.deleteBookValidator = [
  check("id").isMongoId().withMessage("Invalid Book Id format"),
  validatorMiddlware,
];
