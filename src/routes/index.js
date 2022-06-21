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

module.exports = router