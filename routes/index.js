const express = require('express');
const router = express.Router();

// MIDDLEWARE
const ifNotLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}

const ifLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
}

const isAuth = (req, res, next) => {
    if(!req.session.isAuth) {
        return res.send({message: 'Not allow'})
    }
    next()
}

// PAGE

router.get('/', ifNotLoggedIn, (req , res, next) => {
    res.render('index')
})

router.get('/login', ifLoggedIn, (req, res, next) => {
    res.render('login.ejs', {message: ''});
});

router.get('/logout', (req, res, next) => {
    req.session.destroy();
    req.isAuth = false;
    res.redirect('/login');
})

// customer page
router.get('/customer', ifNotLoggedIn, (req, res, next) => {
    res.render('customer')
});

// quotation page
router.get('/quotation', ifNotLoggedIn, (req, res, next) => {
    res.render('quotation')
});

// Home page
router.get('/index', ifNotLoggedIn, (req, res, next) => {
    res.render('index')
});

// Employee page
router.get('/employee', ifNotLoggedIn, (req, res, next) => {
    res.render('employee')
});

// User page
router.get('/users', ifNotLoggedIn, isAuth, (req, res, next) => {
    res.render('users')
})

// Test page
router.get('/test', (req, res, next) => {
    res.render('test')
});

router.get('/sign-in', (req, res, next) => {
    res.render('sign-in')
});

router.get('/sign-up', (req, res, next) => {
    res.render('sign-up')
});

module.exports = router