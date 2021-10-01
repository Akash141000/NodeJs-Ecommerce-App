const Product = require("../model/Product");
const fileHelper = require("../util/file");

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;
  if (!image) {
    res.status(500).render("/");
  } else {
    product = new Product({
      title: title,
      price: price,
      imageUrl: image.path,
      description: description,
      // userId: userId,
    });
    product
      .save()
      .then((result) => {
        res.redirect("/");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode(500);
        return next(error);
      });
  }
};

exports.addProducts = (req, res) => {
  res.render("admin/addProduct", {
    pageTitle: "Add Product",
    path: "admin/addProduct",
  });
};

exports.editProducts = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        res.redirect("/500");
      }
      res.render("admin/editProduct", {
        pageTitle: "Admin Edit Products",
        path: "admin/editProducts",
        product: product,
      });
    })
    .catch();
};

exports.postEditProducts = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      if (updatedImage) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = updatedImage.path;
      }
      product.description = updatedDescription;
      return product.save(prodId);
    })
    .then((result) => {
      console.log("updatedProduct");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      fileHelper.deleteFile(product.imageUrl);
      return Product.findByIdAndRemove(productId);
    })
    .then(() => {
      console.log("product destroyed");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.products = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
