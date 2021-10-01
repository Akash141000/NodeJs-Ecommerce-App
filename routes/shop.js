const express = require('express');
const Router = express.Router(); 
const shopProduct = require('../Control/shop');
const isAuth = require('../middleware/auth');

Router.post("/shop/deleteCartProduct",shopProduct.postDeleteCartProduct);

Router.post("/add-to-cart",shopProduct.postAddToCart);

Router.post("/shop/addOrder",shopProduct.postGetOrders);

Router.get("/shop/product-list",shopProduct.getProduct);

Router.get("/shop/products",shopProduct.getProduct);

Router.get("/shop/cart",isAuth,shopProduct.getCart);

Router.get("/shop/orders",isAuth,shopProduct.getOrders);

Router.get("/checkout/success",shopProduct.getCheckoutSuccess);

Router.get("/checkout/cancel",isAuth,shopProduct.getCheckout);

Router.get("/shop/checkout",isAuth,shopProduct.getCheckout);

Router.get("/product/:productId",shopProduct.getProductDetails);

Router.get("/shop/orders/:orderId",isAuth,shopProduct.getInvoice);

Router.get("/",isAuth,shopProduct.getIndex);

module.exports = Router;
