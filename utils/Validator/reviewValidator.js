const { check } = require("express-validator");

const validatorMiddlware = require("../../middlewares/validatorMiddlware");

const User = require("../../Model/userModel");
const Book = require("../../Model/bookModel");
const Review = require("../../Model/reviewModel");

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Review Rating Required..")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating Value Must be between 1 to 5"),
  check("book")
    .isMongoId()
    .withMessage("Invalid book Id format")
    .notEmpty()
    .withMessage("Review Must Belong To book"),
  check("user")
    .isMongoId()
    .withMessage("Invalid User Id format")
    .notEmpty()
    .withMessage("Review Must Belong To User")
    .custom(async (val, { req }) => {
      const review = await Review.findOne({
        user: req.user._id,
        book: req.body.book,
      });
      if (review) {
        return Promise.reject(new Error("You alredy Created Review Before"));
      }
    }),
  validatorMiddlware,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Book Id format"),
  validatorMiddlware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review Id format")
    .custom(async (val, { req }) => {
      const review = await Review.findById(val);
      if (!review) {
        return Promise.reject(
          new Error(`There is no Review for this id:${val}`)
        );
      }
      if (review.user._id.toString() !== req.user._id.toString()) {
        return Promise.reject(
          new Error(`You are no allowed to access this action`)
        );
      }
    }),
  validatorMiddlware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review Id format")
    .custom(async (val, { req }) => {
      if (req.user.role == "user") {
        const review = await Review.findById(val);
        if (!review) {
          return Promise.reject(
            new Error(`There is no Review for this id:${val}`)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`You are no allowed to access this action`)
          );
        }
      }
      return true;
    }),
  validatorMiddlware,
];
