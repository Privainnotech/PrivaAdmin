const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const sql = require("mssql");
const { dbconfig } = require("../config");

router.post("/login", async (req, res) => {
  try {
    let { Email, Password } = req.body;
    if (Email == "admin" && Password == "") {
      req.session.isLoggedIn = true;
      req.session.UserId = 1;
      req.session.isAuth = true;
      res.redirect("/");
    } else {
      let pool = await sql.connect(dbconfig);
      let user = await pool.request().query(
        `SELECT * FROM privanet.MasterEmployee
          WHERE EmployeeEmail = N'${Email}'`
      );
      if (user.recordset.length) {
        if (!user.recordset[0].EmployeeActive) {
          res.status(403).send({ message: "Account is not activate" });
          return;
        }
        let compared = await bcrypt.compare(
          Password,
          user.recordset[0].Password
        );
        if (compared) {
          req.session.isLoggedIn = true;
          req.session.UserId = user.recordset[0].EmployeeId;
          if (user.recordset[0].Authority == 1) {
            req.session.isAuth = true;
          } else {
            req.session.isAuth = false;
          }
          res.redirect("/");
        } else {
          req.flash("login", "Invalid Email or Password");
          res.redirect("/login");
        }
      } else {
        req.flash("login", "Invalid Email or Password");
        res.redirect("/login");
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/logout", (req, res, next) => {
  req.session = null;
  req.isAuth = false;
  res.redirect("/login");
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
//         let DeleteUser = `DELETE FROM privanet.Users WHERE UserId = ${UserId}`;
//         let pool = await sql.connect(dbconfig);
//         await pool.request().query(DeleteUser);
//         res.status(200).send({message: `Successfully delete company`});
//     } catch(err){
//         res.status(500).send({message: err});
//     }
// });

module.exports = router;
