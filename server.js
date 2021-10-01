////routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authenticationRoutes = require("./routes/authentication");
const errorRoutes = require("./routes/error");

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");

const session = require("express-session");
const mongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const { v4 } = require("uuid");
const helmet = require("helmet");
const compression = require("compression");

//// environment varibles
const port = process.env.PORT || 3000;
const connectionString = process.env.MONGO_CONNECTION;

//img filter for multer
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//file storage for multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    const uid = v4();
    const fileName = file.originalname;
    cb(null, fileName + "-" + uid);
  },
});

//mongo-sessions setup
const store = new mongoDbStore({
  uri: connectionString,
  collection: "sessions",
});

//helmet and compression
app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: false }));

//multer setup
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

//serving static folder
app.use(express.static(path.join(__dirname, "./", "public")));

//img middleware
app.use("/Images", express.static(path.join(__dirname, "./", "Images")));

//mongo-sessions setup
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//setting template engine
app.set("view engine", "ejs");
app.set("views", "view");

app.use((req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user._id)
      .then((user) => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        next(new Error(err));
      });
  } else {
    next();
  }
});

//csrf protection
const csrfProtection = csrf();
app.use(csrfProtection);

//flash for errors
app.use(flash());

//setting auth status nd csrf for every req
app.use((req, res, next) => {
  res.locals.authenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

//middlewares

app.use(authenticationRoutes);
app.use(adminRoutes);
app.use(shopRoutes);
app.use(errorRoutes);

//mongoose connection
mongoose
  .connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((result) => {
    app.listen(port, () => console.log("server started..."));
  })
  .catch((err) => {
    console.log(err);
  });

//error handling middleware

app.use((err, req, res, next) => {
  const errCode = err.statusCode;
  const errMessage = err.message || 500;
  res
    .status(errCode)
    .render("error/500", {
      pageTitle: "Error occured!",
      path: "authenticated/login",
    });
});
