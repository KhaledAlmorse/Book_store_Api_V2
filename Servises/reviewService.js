const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatuers");

const Review = require("../Model/reviewModel");

exports.setBookIdToBody = (req, res, next) => {
  if (!req.body.book) req.body.book = req.params.bookId;
  if (!req.body.user) req.body.user = req.user._id;

  next();
};

/**
 * @description Create Review
 * @route Post /api/v2/reviews
 * @private authour
 */
exports.createReview = asyncHandler(async (req, res, next) => {
  const review = await Review.create({
    title: req.body.title,
    ratings: req.body.ratings,
    user: req.body.user,
    book: req.body.book,
  });

  res.status(201).json({ status: "Succsess", data: review });
});

//Nested Routes
//Get /api/v2/books/:bookId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.bookId) filterObject = { book: req.params.bookId };
  req.filterObj = filterObject;
  next();
};

/**
 * @description Get All Reviews
 * @route Get /api/v2/reviews
 * @private all
 */
exports.getAllReview = asyncHandler(async (req, res, next) => {
  const DocumentsCount = await Review.countDocuments();
  //Build Query
  const apiFeatures = new ApiFeatures(Review.find(req.filterObj), req.query)
    .paginate(DocumentsCount)
    .filter()
    .limitFields()
    .search()
    .sort();

  // Execute Query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const review = await mongooseQuery;

  res.status(200).json({
    status: "Success",
    paginationResult,
    data: review,
  });
});

/**
 * @description Get Specific Review
 * @route Get /api/v2/reviews/:id
 * @private all
 */

exports.getSpecificReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ApiError(`There is no Review for this id:${req.params.id}`)
    );
  }
  res.status(200).json({ status: "Success", data: review });
});

/**
 * @description Update Review
 * @route Put /api/v2/reviews/:id
 * @private admin/manger/authour
 */

exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      ratings: req.body.ratings,
      user: req.body.user,
      book: req.body.book,
    },
    { new: true }
  );
  review.save();
  res.status(200).json({ status: "Success", data: review });
});

/**
 * @description Delete Review
 * @route Delete /api/v2/reviews
 * @private admin/manger/authour
 */

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(
      new ApiError(`There is no Review for this id:${req.params.id}`)
    );
  }
  review.deleteOne();
  res.status(200).json({ status: "Deleted" });
});
