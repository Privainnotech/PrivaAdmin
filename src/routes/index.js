const express = require('express');
const router = express.Router();

const ifNotLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/user/login');
    }
    next();
}

const isAuth = (req, res, next) => {
    if(!req.session.isAuth) {
        return res.send('Not allow')
    }
    next()
}

// home page
router.get('/', (req, res, next) => {
    res.render('index')
});

router.get('/', ifNotLoggedIn, (req , res, next) => {
    res.redirect('index');
  })

// customer page
router.get('/customer', (req, res, next) => {
    res.render('customer')
});

// quotation page
router.get('/quotation', (req, res, next) => {
    res.render('quotation')
});

// Home page
router.get('/index', (req, res, next) => {
    res.render('index')
});

// Employee page
router.get('/employee', (req, res, next) => {
    res.render('employee')
});
module.exports = router