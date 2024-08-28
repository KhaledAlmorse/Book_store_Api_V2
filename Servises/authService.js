const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const { sanitizeUser } = require("../utils/sanitizeData");

const User = require("../Model/userModel");

/**
 * @description Singup
 * @route Post /api/v2/auth/singup
 * @public
 */
exports.singup = asyncHandler(async (req, res, next) => {
  //1-Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
  });
  //2-Generate Token
  const token = createToken(user._id);

  res.status(201).json({ status: "Sucsess", data: sanitizeUser(user), token });
});

/**
 * @description Login
 * @route Post /api/v2/auth/login
 * @public
 */
exports.login = asyncHandler(async (req, res, next) => {
  //1-Check if password and email in the body(validation Layer)
  //2-Check if user exsist,password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError(`Incorrect Email Or Password`, 401));
  }

  //3-Generate Token
  const token = createToken(user._id);
  //4-sent resbonse to client side
  res.status(201).json({ status: "Sucsess", data: user, token });
});

/**
 * @description Make Sure The User is logged in
 */
exports.protect = asyncHandler(async (req, res, next) => {
  //1-Check if token exist ,if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, please Login to get accsess this route",
        401
      )
    );
  }
  //2-Verify token(no change happen,expire token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  //3-check if user exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "the user that belong to this token does no longer exist ",
        401
      )
    );
  }
  //4-check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password, please logain again...",
          401
        )
      );
    }
  }

  if (!currentUser.active) {
    return next(new ApiError("You Need To active Your Acoount", 401));
  }

  req.user = currentUser;
  next();
});

/**
 * @description Authorization [User Permission]
 */
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

/**
 * @description Forgot Password
 * @route Post /api/v2/auth/forgotpassword
 * @public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //1-Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is No User For this Email: ${req.body.email}`, 404)
    );
  }
  //2-if user exsist, Generate hash reset random 6 digit and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //Save hashed password reset code in db
  user.passwordResetCode = hashResetCode;

  user.passwordResetExpire = Date.now() + 10 * 60 * 1000; //(expiration time 10 mints)
  user.passwordResetVerifiy = false;

  user.save();
  //3-send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password on your Book_Store Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Book_Store Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password reset code (Valid For 10mints)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    user.passwordResetVerifiy = undefined;

    await user.save();

    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "success", message: "Reset Code sent To Email" });
});

/**
 * @description Verifiy  Password Reset Code
 * @route Post /api/v2/auth/verifiypassword
 * @public
 */
exports.verifiyResetCode = asyncHandler(async (req, res, next) => {
  const { resetcode } = req.body;

  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetcode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashResetCode,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError(" Reset Code Invaild or Expired", 404));
  }
  user.passwordResetVerifiy = true;
  await user.save();

  res.status(200).json({ status: "success", message: "Reset Code Verified.." });
});

/**
 * @description  Reset Password
 * @route Post /api/v2/auth/resetpassword
 * @public
 */

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //1-Get user based On Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`Ther is No User For This Email:${req.body.email}`, 404)
    );
  }

  //2-Check if reset code verified
  if (!user.passwordResetVerifiy) {
    return next(new ApiError(`Reset Code Not Verified`, 404));
  }
  user.password = req.body.newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetVerifiy = undefined;

  await user.save();

  //3-if everything is okay generate token
  const token = createToken(user._id);

  res.status(201).json({ status: "Sucsess", token });
});
