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

const updatePriceI = async (ItemId) => {
    try{
        let pool = await sql.connect(dbconfig);
        let UpdatePrice = `
            DECLARE @QuotationId bigint
            SET @QuotationId = (SELECT QuotationId FROM QuotationItem WHERE ItemId = ${ItemId})
            
            UPDATE QuotationItem
            SET ItemPrice = (SELECT SUM(a.SubItemQty * b.ProductPrice) 
                FROM QuotationSubItem a
                LEFT JOIN MasterProduct b on a.ProductId = b.ProductId
                WHERE ItemId = ${ItemId})
            WHERE ItemId = ${ItemId}

            UPDATE Quotation
            SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
                FROM QuotationItem 
                WHERE QuotationId = @QuotationId)
            WHERE QuotationId = @QuotationId`;
        await pool.request().query(UpdatePrice);
    } catch(err){
        res.status(500).send({message: err});
    }
}

router.get('/list', async (req, res, next) => {
    try{
        getQuotationList = `SELECT
        row_number() over(order by b.QuotationNo desc) as 'index',
        b.QuotationNoId,
        a.QuotationId,
        a.QuotationStatus,
        b.QuotationNo,
        a.QuotationRevised,
        b.QuotationNo + '_0' + CONVERT(nvarchar(5), a.QuotationRevised) QuotationNo_Revised,
        a.QuotationSubject,
        c.CustomerTitle + c.CustomerFname + ' ' + c.CustomerLname CustomerName,
        a.QuotationTotalPrice,
        a.QuotationDiscount,
        a.QuotationNetVat,
        b.QuotationDate,
        d.StatusName,
        a.QuotationValidityDate,
        a.QuotationPayTerm,
        a.QuotationDelivery,
        CONVERT(nvarchar(max), a.QuotationRemark) AS 'Remark',
        a.EmployeeApproveId
        
        FROM [Quotation] a
        LEFT JOIN [QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
        LEFT JOIN [MasterCustomer] c ON b.CustomerId = c.CustomerId
        LEFT JOIN [MasterStatus] d ON a.QuotationStatus = d.StatusId`;
        let pool = await sql.connect(dbconfig);
        let quotations = await pool.request().query(getQuotationList);
        res.status(200).send(JSON.stringify(quotations.recordset));
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.get('/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId
        let getRevise = await pool.request().query(`SELECT QuotationRevised FROM Quotation WHERE QuotationId = ${QuotationId}`)
        let Revised = '';
        if (getRevise.recordset[0].QuotationRevised<10){
            Revised = '0'+getRevise.recordset[0].QuotationRevised.toString()
        } else {
            Revised = getRevise.recordset[0].QuotationRevised.toString()
        }
        let getQuotation = `SELECT
            b.QuotationNoId,
            b.QuotationNo,
            a.QuotationRevised,
            b.QuotationNo + '_${Revised}' QuotationNo_Revised,
            a.QuotationStatus,
            d.StatusName
            c.CustomerTitle + c.CustomerFname + ' ' + c.CustomerLname CustomerName,
            a.QuotationId,
            a.QuotationSubject,
            b.QuotationDate,
            a.QuotationTotalPrice,
            a.QuotationDiscount,
            a.QuotationNet,
            a.QuotationVat,
            a.QuotationNetVat,
            a.QuotationValidityDate,
            a.QuotationPayTerm,
            a.QuotationDelivery,
            CONVERT(nvarchar(max), a.QuotationRemark) AS 'Remark',
            a.EmployeeApproveId,
            e.EmployeeFname + ' ' + e.EmployeeLname EmployeeName,
            e.EmployeeEmail,
            e.EmployeePosition
            FROM [Quotation] a
            LEFT JOIN [QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
            LEFT JOIN [MasterCustomer] c ON b.CustomerId = c.CustomerId
            LEFT JOIN [MasterStatus] d ON a.QuotationStatus = d.StatusId
            LEFT JOIN [MasterEmployee] e ON a.EmployeeApproveId = e.EmployeeId
            WHERE a.QuotationId = ${QuotationId}`;
        let quotations = await pool.request().query(getQuotation);
        res.status(200).send(JSON.stringify(quotations.recordset[0]));
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.get('/item/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId
        getQuotationItem = `SELECT a.QuotationId, a.ItemId, a.ItemName, a.ItemPrice, a.ItemQty, a.ItemDescription,
                ( SELECT CONVERT(nvarchar(20), b.SubItemId) + ','
                    FROM [QuotationSubItem] b LEFT JOIN [MasterProduct] c ON b.ProductId = c.ProductId
                    WHERE b.ItemId = a.ItemId 
                    FOR XML PATH('')) AS SubItemId
            FROM [QuotationItem] a
            
            WHERE QuotationId = ${QuotationId}`;
        let quotations = await pool.request().query(getQuotationItem);
        res.status(200).send(JSON.stringify(quotations.recordset));
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.get('/subitem/:SubItemId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let SubItemId = req.params.SubItemId
        getQuotationSubItem = `SELECT a.ItemId, b.ProductCode , b.ProductName SubItemName, b.ProductPrice SubItemPrice, a.SubItemQty, a.SubItemUnit
            FROM [QuotationSubItem] a
            LEFT JOIN [MasterProduct] b ON a.ProductId = b.ProductId
            WHERE a.SubItemId = ${SubItemId}`;
        let quotations = await pool.request().query(getQuotationSubItem);
        res.status(200).send(JSON.stringify(quotations.recordset[0]));
    } catch(err){
        res.status(500).send({message: err});
    }
})


router.post('/add_pre_quotation', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let { QuotationSubject, CustomerId } = req.body
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
            // Generate QuotationNo
            let genQuotationNo = '';
            let CheckQuotationNo = await pool.request().query(`
                SELECT *
                FROM QuotationNo
                WHERE QuotationNo LIKE N'%${checkDate()}%'`)
            if (CheckQuotationNo.recordset.length<10) {
                genQuotationNo = 'pre_'+checkDate()+'0'+CheckQuotationNo.recordset.length
            } else {
                genQuotationNo = 'pre_'+checkDate()+CheckQuotationNo.recordset.length
            }
            console.log("Gen QuotationNo: " + genQuotationNo)
            // Insert QuotationNo
            let InsertQuotationNo = `INSERT INTO QuotationNo(QuotationNo,CustomerId) VALUES(N'${genQuotationNo}',${CustomerId})
                SELECT SCOPE_IDENTITY() AS Id`;
            let QuotationNo = await pool.request().query(InsertQuotationNo);
            let QuotationNoId = QuotationNo.recordset[0].Id
            // Insert Quotation with QuotationNoId
            let InsertQuotation = `INSERT INTO Quotation(QuotationNoId, QuotationSubject) VALUES(${QuotationNoId}, N'${QuotationSubject}')
            SELECT SCOPE_IDENTITY() AS Id`;
            let Quotation = await pool.request().query(InsertQuotation);
            let QuotationId = Quotation.recordset[0].Id
            res.status(201).send({message: 'Successfully add Quotation', QuotationId});
        }
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.post('/add_item/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId
        let { ItemName, ItemPrice, ItemQty, ItemDescription } = req.body
        let DescriptionFilter = ItemDescription.replace(/'/g, "''")
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
            res.status(400).send({message: 'Duplicate item in quotation'});
        } else{
            let InsertItem = `INSERT INTO QuotationItem(QuotationId, ItemName, ItemPrice, ItemQty, ItemDescription)VALUES(${QuotationId}, N'${ItemName}', ${ItemPrice}, ${ItemQty}, N'${DescriptionFilter}')`;
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
        // Unit = {Pc, Set, Lot} => Dropdown
        if (ProductId == 'null'){ // Add new product
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
                updatePriceI(ItemId);
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
                let InsertSubItem = `INSERT INTO QuotationSubItem(ItemId, ProductId, SubItemQty, SubItemUnit) VALUES(${ItemId}, ${ProductId}, N'${SubItemQty}', N'${SubItemUnit}')`
                await pool.request().query(InsertSubItem);
                updatePriceI(ItemId);
                res.status(201).send({message: 'Sub-item has been added'});
            }
        }
    } catch(err){
        res.status(500).send({message: err});
    }
})

router.delete('/delete_quotation/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId;
        let Status = await pool.request().query(`SELECT QuotationStatus FROM Quotation WHERE QuotationId = ${QuotationId}`)
        console.log(Status)
        if(Status.recordset[0].QuotationStatus == 1){
            // Delete SubItem
            let selectItem = await pool.request().query(`SELECT ItemId FROM QuotationItem WHERE QuotationId = ${QuotationId}`)
            if (selectItem.recordset.length){
                for(const item of selectItem.recordset){
                    let DeleteSubItem = `DELETE FROM QuotationSubItem WHERE ItemId=${item.ItemId}`;
                    await pool.request().query(DeleteSubItem);
                }
            }
            let DeleteQuotation = `DECLARE @QuotationNoId bigint;
                SET @QuotationNoId = (SELECT QuotationNoId FROM Quotation WHERE QuotationId =  ${QuotationId});
                DELETE FROM QuotationItem WHERE QuotationId=${QuotationId}
                DELETE FROM Quotation WHERE QuotationId=${QuotationId}
                DELETE FROM QuotationNo WHERE QuotationNoId=@QuotationNoId`;
            await pool.request().query(DeleteQuotation);
            res.status(200).send({message: 'Successfully delete pre-quotation'});
        } else {
            res.status(400).send({message: 'Cannot delete quotation'});
        }
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

router.delete('/delete_item/:ItemId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let ItemId = req.params.ItemId;
        let DeleteItem = `DECLARE @QuotationId bigint;
            SET @QuotationId = (SELECT QuotationId FROM QuotationItem WHERE ItemId =  ${ItemId});
            UPDATE QuotationItem
            SET ItemQty = 0
            WHERE ItemId = ${ItemId};
            UPDATE Quotation
            SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
                FROM QuotationItem 
                WHERE QuotationId = @QuotationId)
            WHERE QuotationId = @QuotationId;
            DELETE FROM QuotationItem WHERE ItemId=${ItemId}`;
        let DeleteSubItem = `DELETE FROM QuotationSubItem WHERE ItemId = ${ItemId}`;
        await pool.request().query(DeleteItem);
        await pool.request().query(DeleteSubItem);
        updatePriceI(ItemId);
        res.status(200).send({message: 'Successfully delete Item'});
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

router.delete('/delete_subitem/:SubItemId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let SubItemId = req.params.SubItemId;
        let DeleteSubItem = `DECLARE @QuotationId bigint, @ItemId bigint;
            SET @ItemId = (SELECT ItemId FROM QuotationSubItem WHERE SubItemId = ${SubItemId});
            SET @QuotationId = (SELECT QuotationId FROM QuotationItem WHERE ItemId = @ItemId);
            UPDATE QuotationSubItem
            SET SubItemQty = 0
            WHERE SubItemId = ${SubItemId};
            UPDATE QuotationItem
            SET ItemPrice = (SELECT SUM(a.SubItemQty * b.ProductPrice) 
                FROM QuotationSubItem a
                LEFT JOIN MasterProduct b on a.ProductId = b.ProductId
                WHERE ItemId = @ItemId)
            WHERE ItemId = @ItemId;
            UPDATE Quotation
            SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
                FROM QuotationItem 
                WHERE QuotationId = @QuotationId)
            WHERE QuotationId = @QuotationId;

            DELETE FROM QuotationSubItem WHERE SubItemId = ${SubItemId};`;
        await pool.request().query(DeleteSubItem);
        res.status(200).send({message: 'Successfully delete Sub-item'});
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

router.put('/edit_quotation/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId
        let {
            QuotationSubject,
            CustomerId,
            QuotationDiscount,
            QuotationValidityDate,
            QuotationPayterm,
            QuotationDelivery,
            QuotationRemark,
            EmployeeApproveId
        } = req.body;
        let RemarkFilter = QuotationRemark.replace(/'/g,"''");
        if(CustomerId == 'null'){
            res.status(400).send({message: 'Please select Customer'});
            return;
        }
        if(EmployeeApproveId == 'null'){
            res.status(400).send({message: 'Please select Employee'});
            return;
        }
        console.log('check1')
        let CheckQuotation = await pool.request().query(`SELECT CASE
        WHEN EXISTS(
             SELECT *
             FROM Quotation
             WHERE QuotationSubject = N'${QuotationSubject} AND QuotationId = ${QuotationId}'
        )
        THEN CAST (1 AS BIT)
        ELSE CAST (0 AS BIT) END AS 'check'`);
        if(CheckQuotation.recordset[0].check){
            res.status(400).send({message: 'Duplicate Quotation'});
        } else{
            console.log('check2')
            // Insert Quotation with QuotationNoId
            let UpdateQuotation = `UPDATE Quotation
            SET QuotationSubject = N'${QuotationSubject}',
                QuotationDiscount = ${QuotationDiscount},
                QuotationValidityDate = ${QuotationValidityDate}, 
                QuotationPayterm = N'${QuotationPayterm}',
                QuotationDelivery = N'${QuotationDelivery}',
                QuotationRemark = N'${RemarkFilter}',
                EmployeeApproveId = ${EmployeeApproveId}
            WHERE QuotationId = ${QuotationId}`;
            await pool.request().query(UpdateQuotation);
            res.status(201).send({message: 'Successfully Edit Quotation'});
        }
    } catch(err){
        res.status(500).send({message: err});
    }
})

module.exports = router