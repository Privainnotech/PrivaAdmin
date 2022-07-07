const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const { dbconfig } = require('../config');

const ifLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
}

router.get('/login', ifLoggedIn, (req, res, next) => {
    res.render('login.ejs', {message: ''});
});

router.get('/logout', (req, res, next) => {
    req.session = null;
    req.isAuth = false;
    res.redirect('/user/login');
})

router.post('/login', async (req, res) => {
    try {
        let { Username, Password } = req.body;
        let pool = await sql.connect(dbconfig);
        let user = await pool.request().query(`SELECT * FROM Users WHERE Username = N'${Username}'`);
        if (user.recordset.length) {
            let compared = await bcrypt.compare(Password, user.recordset[0].Password)
            if (compared) {
                req.session.isLoggedIn = true;
                req.session.userID = user.recordset[0].UserId;
                if(user.recordset[0].Role == "admin"){
                    req.session.isAuth = true;
                } else{
                    req.session.isAuth = false;
                }
                res.redirect('/');
            } else {
                console.log('password')
                req.flash('error', 'Invalid Password')
                res.redirect('/user/login')
            }
        } else {
            console.log('username')
            req.flash('error', 'Invalid Username')
            res.redirect('/user/login')
        }
    } catch (err){
        res.status(500).send({message: err});
    }
});

router.post('/register', async (req, res) => {
    try{
        let { Username, Password, Role } = req.body;
        console.log(req.body)
        //role: admin, user
        let pool = await sql.connect(dbconfig);
        let user = await pool.request().query(`SELECT * FROM Users WHERE Username = N'${Username}'`);
        console.log(user.recordset)
        if (!user.recordset.length) {
            let Hashpass = await bcrypt.hash(Password, 12)
            console.log(Hashpass)
            await pool.request().query(`INSERT Users(AvatarPath, Username, Password, Role)
            VALUES(N'./images/avatar/0.png', N'${Username}', N'${Hashpass}', N'admin')`);
            res.send('Your account has been created')
        } else {
            res.status(400).send({message: 'Duplicate Username'});
        }
    } catch(err){
        res.status(500).send({message: err});
    }
});

module.exports = router
