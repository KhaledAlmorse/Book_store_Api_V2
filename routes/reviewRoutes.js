const express = require("express");

const {
  createReview,
  getAllReview,
  getSpecificReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setBookIdToBody,
} = require("../Servises/reviewService");

const authService = require("../Servises/authService");

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/Validator/reviewValidator");

// const router = express.Router({ mergeParams: true });
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setBookIdToBody,
    createReviewValidator,
    createReview
  )
  .get(createFilterObj, getAllReview);
router
  .route("/:id")
  .get(getReviewValidator, getSpecificReview)
  .put(
    authService.protect,
    authService.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo("user", "admin", "manager"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
