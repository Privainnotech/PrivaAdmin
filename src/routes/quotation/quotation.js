const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../../config');

const checkDate = () => {
    let today = new Date();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();
    if (mm<10) { mm='0'+mm; }
    return yyyy+mm;
}

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
            let QuotationNo = '';
            let CheckQuotationNo = await pool.request().query(`
                SELECT *
                FROM QuotationNo
                WHERE QuotationNo LIKE N'%${checkDate()}%'`)
            if (CheckQuotationNo.recordset.length<10) {
                QuotationNo = 'pre_'+checkDate()+'0'+CheckQuotationNo.recordset.length
            } else {
                QuotationNo = 'pre_'+checkDate()+CheckQuotationNo.recordset.length
            }
            console.log("Gen QuotationNo: " + QuotationNo)
            let InsertQuotationNo = `INSERT INTO QuotationNo(QuotationNo,CustomerId) VALUES(N'${QuotationNo}',${CustomerId})
                SELECT SCOPE_IDENTITY() AS NoId`;
            let Quotation = await pool.request().query(InsertQuotationNo);
            console.log("QuotationId: " + Quotation.recordset[0].NoId)
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
        let { ItemName, ItemPrice, ItemQty } = req.body
        //Unit = {Pc, Set, Lot} => Dropdown
        let CheckQuotationItem = await pool.request().query(`SELECT CASE
        WHEN EXISTS(
             SELECT *
             FROM QuotationItem
             WHERE ItemName = N'${ItemName}' AND QuotationId = ${QuotationId}
        )
        THEN CAST (1 AS BIT)
        ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckQuotationItem.recordset[0].check){
            res.status(400).send({message: 'Duplicate Item'});
        } else{
            let InsertItem = `INSERT INTO QuotationItem(QuotationId, ItemName, ItemPrice, ItemQty)VALUES(${QuotationId}, N'${ItemName}', N'${ItemPrice}', N'${ItemQty}')`;
            await pool.request().query(InsertItem);
            res.status(201).send({message: 'Item has been added'});
        }
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.post('/add_subitem/:ItemId&:ProductId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let ItemId = req.params.ItemId;
        let ProductId = req.params.ProductId;
        let { ProductType, SubItemName, SubItemPrice, SubItemQty, SubItemUnit} = req.body;
        // ProductType = {Labor, Material, Internal, Unknown} => Dropdown
        //Unit = {Pc, Set, Lot} => Dropdown
        if (ProductId == 0){ // Add new product
            let CheckProduct = await pool.request().query(`SELECT CASE
            WHEN EXISTS(
                 SELECT *
                 FROM MasterProduct
                 WHERE ProductName = N'${SubItemName}'
            )
            THEN CAST (1 AS BIT)
            ELSE CAST (0 AS BIT) END AS 'check'`);
            if(CheckProduct.recordset[0].check){
                res.status(400).send({message: 'Duplicate Product'});
            } else{
                let ProductCode = '';
                let CheckProductCode = await pool.request().query(`
                    SELECT *
                    FROM MasterProduct
                    WHERE ProductCode LIKE N'%${checkDate()}%'`)
                if (CheckProductCode.recordset.length<10) {
                    ProductCode = ProductType[0]+"_"+checkDate()+'00'+CheckProductCode.recordset.length
                } else if (CheckProductCode.recordset.length<100) {
                    ProductCode = ProductType[0]+"_"+checkDate()+'0'+CheckProductCode.recordset.length
                } else {
                    ProductCode = ProductType[0]+"_"+checkDate()+CheckProductCode.recordset.length
                }
                console.log("Gen ProductCode: " + ProductCode)
                let InsertProduct = `INSERT INTO MasterProduct(ProductCode, ProductName, ProductPrice) VALUES(N'${ProductCode}', N'${SubItemName}', ${SubItemPrice})
                    SELECT SCOPE_IDENTITY() AS Id`;
                let newProduct = await pool.request().query(InsertProduct);
                console.log("ProductId: " + newProduct.recordset[0].Id)
                let InsertSubItem = `INSERT INTO QuotationSubItem(ItemId, ProductId, SubItemQty, SubItemUnit) VALUES(${ItemId}, ${newProduct.recordset[0].Id}, N'${SubItemQty}', N'${SubItemUnit}')`
                await pool.request().query(InsertSubItem);
                res.status(201).send({message: 'Sub-item has been added'});
            }
        } else { // Already have product
            let CheckSubItem = await pool.request().query(`SELECT CASE
                WHEN EXISTS(
                    SELECT *
                    FROM QuotationSubItem
                    WHERE ProductId = ${ProductId} and ItemId = ${ItemId}
                )
                THEN CAST (1 AS BIT)
                ELSE CAST (0 AS BIT) END AS 'check'`);
            if(CheckSubItem.recordset[0].check){
                res.status(400).send({message: 'Duplicate Sub-item'});
            } else {
                let InsertSubItem = `INSERT INTO QuotationSubItem(ItemId, ProductId, SubItemQty) VALUES(${ItemId}, ${ProductId}, N'${SubItemQty}', N'${SubItemUnit}')`
                await pool.request().query(InsertSubItem);
                res.status(201).send({message: 'Sub-item has been added'});
            }
        }
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.delete('/delete_item/:ItemId', async (req, res) => {
    try{
        let pool = await sql.connect(config);
        let ItemId = req.params.ItemId;
        let DeleteItem = `DELETE FROM QuotationItem WHERE ItemId=${ItemId}`;
        let DeleteSubItem = `DELETE FROM QuotationSubItem WHERE ItemId = ${ItemId}`;
        await pool.request().query(DeleteItem);
        await pool.request().query(DeleteSubItem);
        res.status(200).send({message: 'Successfully delete Item'});
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

router.delete('/delete_item/:SubItemId', async (req, res) => {
    try{
        let pool = await sql.connect(config);
        let SubItemId = req.params.SubItemId;
        let DeleteSubItem = `DELETE FROM QuotationSubItem WHERE SubItemId = ${SubItemId}`;
        await pool.request().query(DeleteSubItem);
        res.status(200).send({message: 'Successfully delete Sub-item'});
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

router.get

module.exports = router