const express = require("express");

const {
  createBook,
  getAllBook,
  getSpecifcBook,
  updateBook,
  deleteBook,
  uploadBookImage,
  resizeImage,
  setuserIdToBody,
  createFilterObj,
} = require("../Servises/bookService");

const {
  createBookValidator,
  getBookValidator,
  updateBookValidator,
  deleteBookValidator,
} = require("../utils/Validator/bookValidator");
const authService = require("../Servises/authService");
const reviewRoutes = require("../routes/reviewRoutes");

const router = express.Router({ mergeParams: true });

router.use("/:bookId/reviews", reviewRoutes);

router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager", "authour"),
    uploadBookImage,
    resizeImage,
    setuserIdToBody,
    createBookValidator,
    createBook
  )
  .get(createFilterObj, getAllBook);
router
  .route("/:id")
  .get(getBookValidator, getSpecifcBook)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager", "authour"),
    uploadBookImage,
    resizeImage,
    updateBookValidator,
    updateBook
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin", "manager", "authour"),
    deleteBookValidator,
    deleteBook
  );

module.exports = router;
