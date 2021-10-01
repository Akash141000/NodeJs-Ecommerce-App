const express = require("express");
const Router = express.Router();
const authentication = require("../control/authentication");
const { check, body } = require("express-validator");
const User = require("../model/User");

Router.post("/authentication/postLogin", authentication.postLogin);

Router.post(
  "/authentication/postRegister",
  check("Email").isEmail().withMessage("Enter a valid email!").custom((value,{req})=>{
    return User.findOne({ email: value })
    .then((userFound) => {
      if (userFound) {        
        return Promise.reject("User with email already exists!");
      }
  });
}),
  body("Password", "Enter password with min 6 charachters!")
    .isLength({ min: 6 })
    .isAlphanumeric(),
  body("ConfirmPassword").custom((value, { req }) => {
    if (value !== req.body.Password) {
      throw new Error("Confirm Password and Password does not match!");
    }
    return true;
  }),
  authentication.postRegister
);

Router.post("/authentication/postReset", authentication.postReset);

Router.post("/authentication/newPassword", authentication.updatePassword);

Router.get("/authentication/login", authentication.login);

Router.get("/authentication/logout", authentication.postLogout);

Router.get("/authentication/register", authentication.register);

Router.get("/authentication/reset/:token", authentication.getNewPassword);

Router.get("/authentication/reset", authentication.reset);

module.exports = Router;
