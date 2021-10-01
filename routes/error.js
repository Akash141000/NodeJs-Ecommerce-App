const express = require('express');
const Router = express.Router();
const errorControl = require('../Control/error');

Router.use('/404',errorControl.get404ErrorPage);

Router.use('/500',errorControl.get500ErrorPage);

module.exports = Router;