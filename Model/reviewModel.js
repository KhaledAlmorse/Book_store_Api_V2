const mongoose = require("mongoose");

const Book = require("./bookModel");

const reviewSchema = new mongoose.Schema(
  {
    title: String,

    ratings: {
      type: Number,
      min: [1, "Min Rating value Is 1.0"],
      max: [5, "Max Rating Value Is 5.0"],
      required: [true, "Review Rating Required"],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review Must Belong To User"],
    },

    book: {
      type: mongoose.Schema.ObjectId,
      ref: "Book",
      required: [true, "Review Must Belong To Book"],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name " });
  next();
});

reviewSchema.statics.calcAvarageRatingAndQuantity = async function (bookId) {
  const result = await this.aggregate([
    //1-Stage :- Get all review in specific product
    {
      $match: { book: bookId },
    },
    //2-stage :-group review based in product id
    {
      $group: {
        _id: "book",
        avgRatings: { $avg: "$ratings" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);
  console.log(result);
  if (result.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      ratingsAvarage: result[0].avgRatings,
      ratingsquantity: result[0].ratingQuantity,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      ratingsAvarage: 0,
      ratingsquantity: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAvarageRatingAndQuantity(this.book);
});

reviewSchema.post("deleteOne", async function () {
  await this.constructor.calcAvarageRatingAndQuantity(this.book);
});
module.exports = mongoose.model("Review", reviewSchema);
