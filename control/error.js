exports.get404ErrorPage = (req, res) => {
  res.render("error/404", {
    pageTitle: "Error Page 404",
    path: "/",
    authenticated: req.session.isLoggedIn,
  });
};

exports.get500ErrorPage = (req, res) => {
  res.render("error/500", {
    pageTitle: "Error Page 500",
    path: "/",
    authenticated: req.session.isLoggedIn,
  });
};
