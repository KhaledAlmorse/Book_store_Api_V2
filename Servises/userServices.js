const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatuers");
const createToken = require("../utils/createToken");

const User = require("../Model/userModel");

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

exports.uploadUserImage = uploadSingleImage("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `User-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/users/${fileName}`);

  //Save image into our db
  req.body.image = fileName;

  next();
});

/**
 * @description Create User
 * @route Post /api/v2/users
 * @private admin/manger
 */
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ status: "success", data: user });
});

/**
 * @description Get All User
 * @route Get /api/v2/users
 * @private admin/manger
 */

exports.getAllUser = asyncHandler(async (req, res) => {
  const DocumentsCount = await User.countDocuments();
  //Build Query
  const apiFeatures = new ApiFeatures(User.find(), req.query)
    .paginate(DocumentsCount)
    .filter()
    .limitFields()
    .search()
    .sort();

  // Execute Query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const user = await mongooseQuery;

  res.status(200).json({
    status: "Success",
    paginationResult,
    data: user,
  });
});

/**
 * @description Get Specific User
 * @route Get /api/v2/users/:userId
 * @private admin/manger
 */
exports.getSpecificUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ApiError(`There is no user For This id:${req.params.id}`, 404)
    );
  }
  res.status(201).json({ status: "success", data: user });
});

/**
 * @description Update User
 * @route Put /api/v2/users
 * @private admin/manger
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      image: req.body.image,
      role: req.body.role,
    },
    { new: true }
  );
  res.status(201).json({ status: "success", data: user });
});

/**
 * @description Change user Password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!user) {
    return next(new ApiError(`No User for This id:${req.params.id}`));
  }
  res.status(201).json({ status: "success", data: user });
});

/**
 * @description Delete User
 * @route Delete /api/v2/users
 * @private admin/manger
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(
      new ApiError(`There is no user For This id:${req.params.id}`, 404)
    );
  }
  res.status(201).json({ status: "success", message: "Deleted..." });
});

/**
 * @description Get Logged User data
 * @route Get /api/v2/users/getMe
 * @private Protect / user
 */
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError(`There is no user for this id:${req.user._id}`));
  }

  res.status(200).json({ status: "Success", data: user });
});

/**
 * @description Update Logged User Password
 * @route Get /api/v2/users/updateMypassword
 * @private Protect / user
 */

exports.UpdateLoggedUsePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  const token = createToken(user._id);

  res.status(200).json({ status: "Success", data: user, token });
});

/**
 * @description Update Logged User Data
 * @route Get /api/v2/users/updateMy
 * @private Protect / user
 */
exports.UpdateMe = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ status: "Success", data: updatedUser });
});

/**
 * @description Deactive Logged User
 * @route Get /api/v2/users/deleteMe
 * @private Protect / user
 */
exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "Success" });
});

/**
 * @description Active Logged User
 * @route Get /api/v2/users/activeMe
 * @private Protect / user
 */
exports.activeMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: true });

  res.status(204).json({ status: "Success" });
});
