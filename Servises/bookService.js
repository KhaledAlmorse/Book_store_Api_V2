const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatuers");

const Book = require("../Model/bookModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

exports.uploadBookImage = uploadSingleImage("imageCover");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `Book-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/books/${fileName}`);

  //Save image into our db
  req.body.imageCover = fileName;

  next();
});

exports.setuserIdToBody = (req, res, next) => {
  if (!req.body.user) req.body.user = req.params.userId;
  next();
};
/**
 * @description Create Book
 * @route Post /api/v2/books
 * @private authour
 */
exports.createBook = asyncHandler(async (req, res, next) => {
  //Nested routes

  const book = await Book.create({
    user: req.body.user,
    name: req.body.name,
    slug: slugify(req.body.name),
    title: req.body.title,
    price: req.body.price,
    imageCover: req.body.imageCover,
    ratingsquantity: req.body.ratingsquantity,
    ratingsAvarage: req.body.ratingsAvarage,
  });

  res.status(201).json({ status: "Succsess", data: book });
});

//Nested Routes
//Get /api/v2/users/:userId/books
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.userId) filterObject = { user: req.params.userId };
  req.filterObj = filterObject;
  next();
};
/**
 * @description Get All Books
 * @route Get /api/v2/books
 * @private all
 */
exports.getAllBook = asyncHandler(async (req, res, next) => {
  const DocumentsCount = await Book.countDocuments();
  //Build Query
  const apiFeatures = new ApiFeatures(Book.find(), req.query)
    .paginate(DocumentsCount)
    .filter()
    .limitFields()
    .search()
    .sort();

  // Execute Query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const book = await mongooseQuery;

  res.status(200).json({
    status: "Success",
    paginationResult,
    data: book,
  });
});

/**
 * @description Get Specific Book
 * @route Get /api/v2/books/:bookId
 * @private all
 */

exports.getSpecifcBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate("reviews");
  if (!book) {
    return next(new ApiError(`There is no book for this id:${req.params.id}`));
  }
  res.status(200).json({ status: "Success", data: book });
});

/**
 * @description Update Book
 * @route Put /api/v2/books/:bookId
 * @private admin/manger/authour
 */

exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    {
      user: req.body.user,
      name: req.body.name,
      title: req.body.title,
      price: req.body.price,
      imageCover: req.body.imageCover,
    },
    { new: true }
  );
  book.save();
  res.status(200).json({ status: "Success", data: book });
});

/**
 * @description Delete Book
 * @route Delete /api/v2/books
 * @private admin/manger/authour
 */

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    return next(new ApiError(`There is no book for this id:${req.params.id}`));
  }
  book.deleteOne();
  res.status(200).json({ status: "Deleted" });
});
