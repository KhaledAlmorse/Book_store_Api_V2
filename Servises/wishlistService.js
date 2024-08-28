const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");

const User = require("../Model/userModel");

/**
 * @description Add Product To WishList
 * @route Post /api/v2/wishlists
 * @private user
 */
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishList: req.body.bookId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "Sucsess",
    message: "Product added successfully to your wishlist",
    data: user.wishList,
  });
});

/**
 * @description Remove Product From Our WishList
 * @route Delete /api/v2/wishlists/:bookId
 * @private user
 */
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishList: req.params.bookId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "Sucsess",
    message: "Product Removed successfully from our wishlist",
    data: user.wishList,
  });
});

/**
 * @description Get Logged user Wishlist
 * @route Get /api/v2/wishlists
 * @private user
 */

exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishList");
  res.status(200).json({
    status: "Sucsess",
    results: user.wishList.length,
    data: user.wishList,
  });
});
