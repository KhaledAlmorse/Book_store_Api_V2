const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is Required.."],
      maxlength: [20, "Too Long User name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is Required.."],
    },
    password: {
      type: String,
      required: [true, "Password is Required.."],
      minlength: [6, "Too short password"],
    },

    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpire: Date,
    passwordResetVerifiy: Boolean,

    phone: String,
    image: String,

    role: {
      type: String,
      enum: ["user", "authour", "admin", "manager"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    wishList: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  //Hashing User Password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/Users/${doc.image}`;
    doc.image = imageUrl;
  }
};
//FindAll,FindOne,Update
userSchema.post("init", (doc) => {
  setImageUrl(doc);
});
//Create
userSchema.post("save", (doc) => {
  setImageUrl(doc);
});

module.exports = mongoose.model("User", userSchema);
