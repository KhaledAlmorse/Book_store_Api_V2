const path = require("path");

const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const dbConnection = require("./config/database");

const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errMiddleware");
//Mount Routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

//Connect with DB
dbConnection();

//express app
const app = express();

//express middleware
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// To remove data (applay santization)
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many account Created for This Ip,Please Try agin after 15mints",
});
app.use("/api", limiter);

app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

//routes
app.use("/api/v2/users", userRoutes);
app.use("/api/v2/books", bookRoutes);
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/reviews", reviewRoutes);
app.use("/api/v2/wishlists", wishlistRoutes);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't Find This route: ${req.originalUrl}`, 404));
});

//Global Error Handling middlware for express
app.use(globalError);

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App Running On Port ${port}`);
});

//Handel rejection error outside Express
process.on("unhandledRejection", (err) => {
  console.log(`UnhandledRejection Errors :${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting Down....");
    process.exit(1);
  });
});
