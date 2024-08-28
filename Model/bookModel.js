const mongoose = require("mongoose");

const bookschema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "The Book must belong to User"],
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Book Name Required"],
      maxlength: [20, "Too Long Book Name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, "Book Title Required"],
      minlength: [50, "Too Short Book Title"],
    },
    price: {
      type: Number,
      required: [true, "Book Price Required"],
    },
    imageCover: String,

    ratingsquantity: {
      type: Number,
      default: 0,
    },
    ratingsAvarage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [1, "Rating must be below or equal 5.0"],
    },
  },
  {
    timestamps: true,
    //To enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookschema.virtual("reviews", {
  ref: "Review",
  foreignField: "book",
  localField: "_id",
});

bookschema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name -_id" });
  next();
});

const setImageUrl = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/Books/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
};
//FindAll,FindOne,Update
bookschema.post("init", (doc) => {
  setImageUrl(doc);
});
//Create
bookschema.post("save", (doc) => {
  setImageUrl(doc);
});

module.exports = mongoose.model("Book", bookschema);
