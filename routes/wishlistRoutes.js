const express = require("express");

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../Servises/wishlistService");

const authService = require("../Servises/authService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(addProductToWishlist).get(getLoggedUserWishlist);
router.route("/:bookId").delete(removeProductFromWishlist);

module.exports = router;
