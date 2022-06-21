const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../../config');

router.get('/list', async (req, res, next) => {
    try{
        getQuotationList = `SELECT
        row_number() over(order by a.QuotationId desc) as 'index',
        a.QuotationId,
        a.QuotationNo,
        a.QuotationSubject Subject,
        b.CustomerTitle + b.CustomerFname + b.CustomerLname Customer,
        a.QuotationDate,
        a.QuotationStatus Status
        FROM [Quotation] a
        LEFT JOIN [MasterCustomer] b ON a.CustomerId = b.CustomerId`;
        let pool = await sql.connect(dbconfig);
        let quotations = await pool.request().query(getQuotationList);
        res.status(200).send(JSON.stringify(quotations.recordset));
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.post('/add_quotation', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let { QuotationSubject, CustomerId, } = req.body
        let CheckQuotation = await pool.request().query(`SELECT CASE
        WHEN EXISTS(
             SELECT *
             FROM Quotation
             WHERE QuotationSubject = N'${QuotationSubject}'
        )
        THEN CAST (1 AS BIT)
        ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckQuotation.recordset[0].check){
            res.status(400).send({message: 'Duplicate Quotation'});
        } else{
            let today = new Date();
            let mm = today.getMonth()+1;
            let yyyy = today.getFullYear();
            if (mm<10) { mm='0'+mm; }
            today = yyyy+mm;
            let CheckQuotationNo = await pool.request().query(`
                SELECT *
                FROM Quotation
                WHERE QuotationNo LIKE N'%${today}%'`)
            let QuotationNo = 'pre_'+today+CheckQuotationNo.recordset.length
            if(CheckQuotationNo.recordset[0].check){
                QuotationNo = 'pre_'+today+'00'
            }
            let InsertQuotationNo = `INSERT INTO QuotationNo(CustomerId) VALUES(${CustomerId})
                SELECT SCOPE_IDENTITY() AS NoId`;
            let Quotation = await pool.request().query(InsertQuotationNo);
            console.log(Quotation.recordset[0].NoId)
            let InsertQuotation = `INSERT INTO Quotation(QuotationNoId, QuotationSubject) VALUES(${Quotation.recordset[0].NoId}, N'${QuotationSubject}')`;
            await pool.request().query(InsertQuotation);
            let SelectLatest = await pool.request().query(`SELECT max(QuotationId) AS 'QuotationId' FROM Quotation`);
            let QuotationId = SelectLatest.recordset[0].QuotationId
            res.status(201).send({message: 'Successfully add Ref.No.', QuotationId});
        }
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.post('/add_item/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId
        let {
            ItemName,
            ItemPrice,
            ItemQty
        } = req.body
        getQuotationList = `SELECT
        row_number() over(order by a.QuotationId desc) as 'index',
        a.QuotationId,
        a.QuotationNo,
        a.QuotationSubject Subject,
        b.CustomerTitle + b.CustomerFname + b.CustomerLname Customer,
        a.QuotationDate,
        a.QuotationStatus Status
        FROM [Quotation] a
        LEFT JOIN [MasterCustomer] b ON a.CustomerId = b.CustomerId`;
        
        let quotations = await pool.request().query(getQuotationList);
        res.status(200).send(JSON.stringify(quotations.recordset));
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.post('/add_subitem/:ItemId&:ProductId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let ItemId = req.params.ItemId;
        let ProductId = req.params.ProductId;
        let SubItemQty = req.body.SubItemQty;
        getQuotationList = `SELECT
        row_number() over(order by a.QuotationId desc) as 'index',
        a.QuotationId,
        a.QuotationNo,
        a.QuotationSubject Subject,
        b.CustomerTitle + b.CustomerFname + b.CustomerLname Customer,
        a.QuotationDate,
        a.QuotationStatus Status
        FROM [Quotation] a
        LEFT JOIN [MasterCustomer] b ON a.CustomerId = b.CustomerId`;
        
        let quotations = await pool.request().query(getQuotationList);
        res.status(200).send(JSON.stringify(quotations.recordset));
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.get

module.exports = router