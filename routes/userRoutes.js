const express = require("express");

const {
  createUser,
  getAllUser,
  getSpecificUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changePassword,
  getLoggedUserData,
  UpdateLoggedUsePassword,
  UpdateMe,
  deleteMe,
  activeMe,
} = require("../Servises/userServices");
const authService = require("../Servises/authService");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/Validator/userValidator");

const router = express.Router();

const bookRoutes = require("../routes/bookRoutes");
router.use("/:userId/books", bookRoutes);

router.route("/getMe").get(authService.protect, getLoggedUserData);

router
  .route("/updateMypassword")
  .put(authService.protect, UpdateLoggedUsePassword);

//طبقهم على بوستمان)activeMe check if work or not
router
  .route("/updateMe")
  .put(authService.protect, updateLoggedUserValidator, UpdateMe);

router.route("/deleteMe").delete(authService.protect, deleteMe);
router.route("/activeMe/:id").delete(activeMe);

//Amin-Manger
router.use(authService.protect, authService.allowedTo("admin", "manager"));

router.route("/changPassword/:id").put(changePasswordValidator, changePassword);

router
  .route("/")
  .post(uploadUserImage, resizeImage, createUserValidator, createUser)
  .get(getAllUser);
router
  .route("/:id")
  .get(getUserValidator, getSpecificUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
