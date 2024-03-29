const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { dbconfig } = require("../../config");

// Show Dropdown
router.get("/company", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let SelectCompany = `Select * FROM privanet.MasterCompany
      WHERE CompanyActive = 1 order by CompanyName`;
    let Company = await pool.request().query(SelectCompany);
    res.status(200).send(JSON.stringify(Company.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/customer", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let SelectCustomer = `Select * FROM privanet.MasterCustomer
      WHERE CustomerActive = 1 order by CustomerName`;
    let Customer = await pool.request().query(SelectCustomer);
    res.status(200).send(JSON.stringify(Customer.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/status", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let SelectStatus = `Select * FROM privanet.MasterStatus order by StatusId`;
    let Status = await pool.request().query(SelectStatus);
    res.status(200).send(JSON.stringify(Status.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/employee", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let SelectEmployee = `Select *, EmployeeTitle+EmployeeFname+' '+EmployeeLname EmployeeName
      FROM privanet.MasterEmployee
      WHERE EmployeeActive = 1 AND Authority = 1 order by EmployeeFname`;
    let Employee = await pool.request().query(SelectEmployee);
    res.status(200).send(JSON.stringify(Employee.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/approver", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let SelectEmployee = `Select *, EmployeeTitle+EmployeeFname+' '+EmployeeLname EmployeeName
      FROM privanet.MasterEmployee
      WHERE EmployeeActive = 1 AND Approver = 1 order by EmployeeFname`;
    let Employee = await pool.request().query(SelectEmployee);
    res.status(200).send(JSON.stringify(Employee.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/product", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let SelectEmployee = `Select * FROM privanet.MasterProduct order by ProductCode`;
    let Employee = await pool.request().query(SelectEmployee);
    res.status(200).send(JSON.stringify(Employee.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

// Get Data
router.get("/customer/:CustomerId", async (req, res) => {
  
  try {
    let pool = await sql.connect(dbconfig);
    let CustomerId = req.params.CustomerId;
    let SelectCustomer = `Select
      a.CustomerId, a.CustomerName, a.CustomerEmail, b.CompanyId, b.CompanyName, b.CompanyAddress
      FROM privanet.[MasterCustomer] a
      LEFT JOIN privanet.[MasterCompany] b ON a.CompanyId = b.CompanyId
      WHERE CustomerId = ${CustomerId}`;
    let Customer = await pool.request().query(SelectCustomer);
    res.status(200).send(JSON.stringify(Customer.recordset[0]));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.get("/product/:ProductId", async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let ProductId = req.params.ProductId;
    let SelectProduct = `Select ProductId, ProductCode,
      ProductName, ProductType
      FROM privanet.MasterProduct WHERE ProductId = ${ProductId}`;
    let Product = await pool.request().query(SelectProduct);
    res.status(200).send(JSON.stringify(Product.recordset[0]));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

module.exports = router;
