const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../../config');

// Show Dropdown
router.get('/company', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let SelectCompany = `Select * FROM MasterCompany WHERE CompanyActive = 1 order by CompanyName`;
        let Company = await pool.request().query(SelectCompany);
        res.status(200).send(JSON.stringify(Company.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.get('/customer', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let SelectCustomer = `Select * FROM MasterCustomer WHERE CustomerActive = 1 order by CustomerFname`;
        let Customer = await pool.request().query(SelectCustomer);
        res.status(200).send(JSON.stringify(Customer.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.get('/status', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let SelectStatus = `Select * FROM MasterStatus order by StatusId`;
        let Status = await pool.request().query(SelectStatus);
        res.status(200).send(JSON.stringify(Status.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.get('/employee', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let SelectEmployee = `Select * FROM MasterEmployee order by EmployeeFname`;
        let Employee = await pool.request().query(SelectEmployee);
        res.status(200).send(JSON.stringify(Employee.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.get('/product', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let SelectEmployee = `Select * FROM MasterProduct order by ProductCode`;
        let Employee = await pool.request().query(SelectEmployee);
        res.status(200).send(JSON.stringify(Employee.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

// Get Data
router.get('/Customer/:CustomerId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let CustomerID = req.params.CustomerID;
        let SelectCustomer = `Select
        a.CustomerId, a.CustomerTitle, a.CustomerFname, a.CustomerLname,
        a.CustomerEmail, b.CompanyId, b.CompanyName, b.CompanyAddress
        FROM [Customer] a
        LEFT JOIN [Company] b ON a.CompanyId = b.CompanyId
        WHERE CustomerId = ${CustomerID}`;
        let Customer = await pool.request().query(SelectCustomer);
        res.status(200).send(JSON.stringify(Customer.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

module.exports = router