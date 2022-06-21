const express = require('express');
const router = express.Router();
const { pool } = require('../../../config');

// Show Dropdown
router.get('/company', async (req, res) => {
    try{
        let SelectCompany = `Select * FROM MasterCompany order by CompanyName`;
        let Company = await pool.request().query(SelectCompany);
        res.status(200).send(JSON.stringify(Company.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

router.get('/customer', async (req, res) => {
    try{
        let SelectCustomer = `Select * FROM MasterCustomer order by CustomerFname`;
        let Customer = await pool.request().query(SelectCustomer);
        res.status(200).send(JSON.stringify(Customer.recordset));
    } catch(err){
        res.status(500).send({message: `${err}`});
    }
})

// Get Data
router.get('/customer/:CustomerID', async (req, res) => {
    try{
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

router.get('/customer/:CustomerID', async (req, res) => {
    try{
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