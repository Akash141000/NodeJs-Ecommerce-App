const User = require("../model/User");
const bcrypt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const transport = nodeMailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "5db9de5fd44829",
    pass: "9fe68de19d9bd3",
  },
});

exports.login = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("authentication/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

exports.register = (req, res) => {
  res.render("authentication/register", {
    pageTitle: "Register",
    path: "/register",
    errorMessage: null,
  });
};

exports.postRegister = (req, res, next) => {
  const name = req.body.Fullname;
  const email = req.body.Email;
  const password = req.body.Password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("authentication/register", {
      pageTitle: "Register",
      path: "/register",
      errorMessage: errors.array()[0].msg,
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/authentication/login");
      return transport.sendMail({
        to: "220877ffcd-548160@inbox.mailtrap.io",
        from: "demo@demoMail.com",
        subject: "signup succed",
        html: "<h1>Acount created Successfully!</h1>",
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogin = (req, res, next) => {
  const email = req.body.Email;
  const password = req.body.Password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password!");
        return res.redirect("/authentication/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/");
              if (err) {
                console.log(err);
              }
            });
          }
          req.flash("error", "Invalid email or password!");
          return res.redirect("/authentication/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/authentication/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.Email })
      .then((user) => {
        if (!user) {
          req.flash("errorReset", "No user Found!");
          return res.redirect("/authentication/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save().then((result) => {
          res.redirect("/");
          transport.sendMail({
            to: "220877ffcd-548160@inbox.mailtrap.io",
            from: "demo@demoMail.com",
            subject: "Password Reset",
            html: `<p>You requested password reset link</p>
            <p>click this <a href= "http://localhost:3000/authentication/reset/${token}">link</a></p>`,
          });
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.reset = (req, res, next) => {
  let message = req.flash("errorReset");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("authentication/reset", {
    pageTitle: "reset",
    path: "/reset",
    errorMessage: message,
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("authentication/newPassword", {
        pageTitle: "new password",
        path: "/newPassword",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.updatePassword = (req, res, next) => {
  const newPassword = req.body.Password;
  const userId = req.body.UserId;
  const passwordToken = req.body.PasswordToken;

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
