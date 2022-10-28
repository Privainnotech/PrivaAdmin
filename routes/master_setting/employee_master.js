const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const sql = require("mssql");
const { dbconfig } = require("../../config");

router.get("/data", async (req, res, next) => {
  try {
    let SelectEmployee = `SELECT row_number() over(order by EmployeeFname) as 'index', *,
        EmployeeTitle+EmployeeFname+' '+EmployeeLname EmployeeName
      FROM privanet.MasterEmployee
      WHERE EmployeeActive = 1 ORDER BY EmployeeFname`;
    let pool = await sql.connect(dbconfig);
    let Employee = await pool.request().query(SelectEmployee);
    res.status(200).send(JSON.stringify(Employee.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.post("/add", async (req, res, next) => {
  try {
    let { EmployeeTitle, EmployeeFname, EmployeeLname, EmployeeTel } = req.body;
    let { EmployeeEmail, EmployeePosition, Password, Authority, Approver } =
      req.body;
    if (EmployeeFname == "" || EmployeeEmail == "" || Password == "") {
      res.status(400).send({
        message: "Please enter Employee's firstname, email and password",
      });
      return;
    }
    let pool = await sql.connect(dbconfig);
    let CheckEmployee = await pool.request().query(`SELECT *
        FROM privanet.MasterEmployee
        WHERE EmployeeEmail = N'${EmployeeEmail}'`);
    let Hashpass = await bcrypt.hash(Password, 12);
    if (!CheckEmployee.recordset.length) {
      let InsertEmployee = `INSERT INTO privanet.MasterEmployee
          (EmployeeTitle, EmployeeFname, EmployeeLname, EmployeeTel,
          EmployeeEmail, EmployeePosition, Password, Authority, Approver)
        VALUES (N'${EmployeeTitle}', N'${EmployeeFname}', N'${EmployeeLname}',
          N'${EmployeeTel}', N'${EmployeeEmail}', N'${EmployeePosition}',
          N'${Hashpass}',${Authority}, ${Approver})`;
      await pool.request().query(InsertEmployee);
      res.status(201).send({ message: "Successfully add Employee" });
    } else {
      if (CheckEmployee.recordset[0].EmployeeActive) {
        res.status(400).send({ message: "Duplicate Employee" });
      } else {
        let ActivateEmployee = `UPDATE privanet.MasterEmployee
          SET
          EmployeeTitle = N'${EmployeeTitle}', EmployeeFname = N'${EmployeeFname}',
          EmployeeLname = N'${EmployeeLname}', EmployeeTel = N'${EmployeeTel}',
          EmployeePosition = N'${EmployeePosition}', Password = N'${Hashpass}',
          Authority = ${Authority}, Approver = ${Approver},
          EmployeeActive = 1
          WHERE EmployeeEmail = N'${EmployeeEmail}'`;
        await pool.request().query(ActivateEmployee);
        res.status(201).send({ message: "Successfully add customer" });
      }
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/edit/:EmployeeId", async (req, res) => {
  try {
    let EmployeeId = req.params.EmployeeId;
    let { EmployeeTitle, EmployeeFname, EmployeeLname } = req.body;
    let { EmployeeTel, EmployeeEmail, EmployeePosition } = req.body;
    if (EmployeeFname == "" || EmployeeEmail == "") {
      res
        .status(400)
        .send({ message: "Please enter Employee's firstname and email" });
      return;
    }
    let pool = await sql.connect(dbconfig);
    let CheckEmployee = await pool.request().query(`SELECT CASE
      WHEN EXISTS(
        SELECT *
        FROM privanet.MasterEmployee
        WHERE EmployeeEmail = N'${EmployeeEmail}' AND NOT EmployeeId = ${EmployeeId}
      )
      THEN CAST (1 AS BIT)
      ELSE CAST (0 AS BIT) END AS 'check'`);
    if (CheckEmployee.recordset[0].check) {
      res.status(400).send({ message: "Duplicate Employee Email" });
    } else {
      let UpdateEmployee = `UPDATE privanet.MasterEmployee
        SET
        EmployeeTitle = N'${EmployeeTitle}', EmployeeFname = N'${EmployeeFname}',
        EmployeeLname = N'${EmployeeLname}', EmployeeTel = N'${EmployeeTel}',
        EmployeeEmail = N'${EmployeeEmail}', EmployeePosition = N'${EmployeePosition}'
        WHERE EmployeeId = ${EmployeeId}`;
      await pool.request().query(UpdateEmployee);
      res.status(200).send({ message: `Successfully edit Employee` });
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/change_password/:EmployeeId", async (req, res) => {
  try {
    let EmployeeId = req.params.EmployeeId;
    let { Password } = req.body;
    if (Password == "") {
      res.status(400).send({ message: "Please enter Password" });
      return;
    }
    let pool = await sql.connect(dbconfig);
    let Hashpass = await bcrypt.hash(Password, 12);
    let UpdateEmployee = `UPDATE privanet.MasterEmployee
      SET Password = N'${Hashpass}'
      WHERE EmployeeId = ${EmployeeId}`;
    await pool.request().query(UpdateEmployee);
    res.status(200).send({ message: `Successfully change password` });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put("/change_authority/:EmployeeId", async (req, res) => {
  try {
    let EmployeeId = req.params.EmployeeId;
    let UserId = req.session.UserId;
    if (UserId == "") return res.status(400).send({ message: "Please login" });
    let { Authority } = req.body;
    if (UserId == EmployeeId && Authority == 0)
      return res.status(400).send({ message: "Cannot de-authority yourself" });
    let pool = await sql.connect(dbconfig);
    let UpdateEmployee = `UPDATE privanet.MasterEmployee
      SET Authority = ${Authority}
      WHERE EmployeeId = ${EmployeeId}`;
    await pool.request().query(UpdateEmployee);
    res.status(200).send({ message: `Successfully change authority` });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});
router.put("/change_approval/:EmployeeId", async (req, res) => {
  try {
    let EmployeeId = req.params.EmployeeId;
    let { Approver } = req.body;
    let pool = await sql.connect(dbconfig);
    let UpdateEmployee = `UPDATE privanet.MasterEmployee
      SET Approver = ${Approver}
      WHERE EmployeeId = ${EmployeeId}`;
    await pool.request().query(UpdateEmployee);
    res.status(200).send({ message: `Successfully change approval` });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.delete("/delete/:EmployeeId", async (req, res) => {
  try {
    let EmployeeId = req.params.EmployeeId;
    let DeleteEmployee = `UPDATE privanet.MasterEmployee
      SET EmployeeActive = 0
      WHERE EmployeeId = ${EmployeeId}`;
    let pool = await sql.connect(dbconfig);
    await pool.request().query(DeleteEmployee);
    req.session.destroy();
    req.isAuth = false;
    res.status(200).send({ message: `Successfully delete Employee` });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

module.exports = router;
