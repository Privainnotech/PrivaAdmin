const express = require("express");
const router = express.Router();

// MIDDLEWARE
const ifNotLoggedIn = (req, res, next) => {
  console.log(req.session)
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};

const ifLoggedIn = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }
  next();
};

const isAuth = (req, res, next) => {
  if (!req.session.isAuth) {
    req.flash("page", "employee");
    req.flash("status", "Unauthorized");
    req.flash("error", "You are not allowed to access this page");
    return res.status(401).render("error");
    // return res.status(401).send({message: 'Not allow'})
  }
  next();
};

// PAGE

router.get("/", ifNotLoggedIn, (req, res, next) => {
  req.flash("page", "home");
  res.render("index");
});

router.get("/login", ifLoggedIn, (req, res, next) => {
  res.render("login");
});

// customer page
router.get("/customer", ifNotLoggedIn, (req, res, next) => {
  req.flash("page", "customer");
  res.render("customer");
});

// quotation page
router.get("/quotation", ifNotLoggedIn, (req, res, next) => {
  req.flash("page", "quotation");
  res.render("quotation");
});

// Employee page
router.get("/employee", ifNotLoggedIn, isAuth, (req, res, next) => {
  req.flash("page", "employee");
  res.render("employee");
});

// Test page
router.get("/test", (req, res, next) => {
  res.render("test");
});

// router.get('/error', (req, res, next) => {
//     res.render('error')
// });

module.exports = router;
