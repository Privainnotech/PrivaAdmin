const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const { dbconfig } = require('../config');

const ifLoggedIn = (req, res, next) => {
    // if (req.session.isLoggedIn) {
    if (false) {
        return res.redirect('/');
    }
    next();
}

router.get('/login', ifLoggedIn, (req, res, next) => {
    res.render('login', {message: ''});
});

router.post('/login', async (req, res) => {
    let { username, password } = req.body;
    let pool = await sql.connect(dbconfig);
    let user = await pool.request().query(`SELECT * FROM users WHERE username = ${username}`);
    if (user.recordset.length) {
        let compared = await bcrypt.compare(password, user.recordset[0].password)
        if (compared) {
            req.session.isLoggedIn = true;
            req.session.userID = user.recordset[0].userId;
            res.redirect('/');
        } else {
            // req.flash('error', 'Invalid Password')
            // res.redirect('/user/login')
            res.send('Invalid Password')
        }
    } else {
        // req.flash('error', 'Invalid Username')
        // res.redirect('/user/login')
        res.send('Invalid Username')
    }
});

router.get('/logout', (req, res, next) => {
    req.session = null;
    req.isAuth = false;
    req.redirect('/user/login');
})

module.exports = router
