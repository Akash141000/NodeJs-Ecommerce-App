const express = require('express');
const Router = express.Router();
const adminProduct = require('../control/admin');
const isAuth = require('../middleware/auth');

Router.post("/admin/addProduct",adminProduct.postAddProduct);

Router.post("/admin/editProducts/product",adminProduct.postEditProducts);

Router.post("/admin/deleteProduct",adminProduct.postDeleteProduct)

Router.get("/admin/addProduct",isAuth,adminProduct.addProducts);

Router.get("/admin/products",isAuth,adminProduct.products);

Router.get("/admin/editProducts/:productId",isAuth,adminProduct.editProducts);





module.exports = Router;
