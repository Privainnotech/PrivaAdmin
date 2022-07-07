const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const { dbconfig } = require('../config');

router.post('/login', async (req, res) => {
    try {
        let { Username, Password } = req.body;
        let pool = await sql.connect(dbconfig);
        let user = await pool.request().query(`SELECT * FROM MasterEmployee WHERE EmployeeFname = N'${Username}'`);
        if (user.recordset.length) {
            if (!user.recordset[0].EmployeeActive) {
                res.status(403).send({message: 'Account is not activate'});
                return;
            }
            let compared = await bcrypt.compare(Password, user.recordset[0].Password)
            if (compared) {
                req.session.isLoggedIn = true;
                req.session.UserId = user.recordset[0].EmployeeId;
                if(user.recordset[0].Authority == 1){
                    req.session.isAuth = true;
                } else{
                    req.session.isAuth = false;
                }
                res.redirect('/');
            } else {
                console.log('password')
                req.flash('error', 'Invalid Password')
                res.redirect('/login')
            }
        } else {
            console.log('username')
            req.flash('error', 'Invalid Username')
            res.redirect('/login')
        }
    } catch (err){
        res.status(500).send({message: err});
    }
});

// User setting
// router.put('/edit/:UserId', async (req, res) => {
//     try{
//         let UserId = req.params.UserId;
//         let { Password, Role } = req.body;
//         console.log(req.body)
//         //role: admin, user
//         if (Password == '') {
//             res.status(400).send({message: 'Please enter Password'});
//             return;
//         }
//         let pool = await sql.connect(dbconfig);
//         let Hashpass = await bcrypt.hash(Password, 12)
//         console.log(Hashpass)
//         await pool.request().query(`UPDATE Users
//         SET Password=N'${Hashpass}', Role=N'${Role}'
//         WHERE UserId = ${UserId}`);
//         res.send('Your account has been edited')
//     } catch(err){
//         res.status(500).send({message: err});
//     }
// });

// router.delete('/delete/:UserId', async (req, res) => {
//     try{
//         let UserId = req.params.UserId;
//         let DeleteUser = `DELETE FROM Users WHERE UserId = ${UserId}`;
//         let pool = await sql.connect(dbconfig);
//         await pool.request().query(DeleteUser);
//         res.status(200).send({message: `Successfully delete company`});
//     } catch(err){
//         res.status(500).send({message: err});
//     }
// });

module.exports = router
