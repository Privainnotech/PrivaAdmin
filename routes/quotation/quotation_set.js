const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../config');

const checkMonth = () => {
    let today = new Date();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();
    if (mm<10) { mm='0'+mm; }
    return yyyy+mm;
}

const checkDate = () => {
    let today = new Date();
    let dd = today.getDate()
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();
    if (dd<10) { dd='0'+dd; }
    if (mm<10) { mm='0'+mm; }
    // yyyy = yyyy[3]+yyyy[4]
    return dd+'-'+mm+'-'+yyyy;
}

//revised quotation
router.post('/revise/:OldQuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let OldQuotationId = req.params.OldQuotationId;
        let {
            QuotationNoId,
            QuotationRevised,
            QuotationSubject,
            QuotationStatus,
            QuotationTotalPrice,
            QuotationDiscount,
            QuotationValidityDate,
            QuotationPayTerm,
            QuotationDelivery,
            QuotationRemark,
            EmployeeApproveId,
            EndCustomer
        } = req.body
        if (!EndCustomer) EndCustomer="";
        if (!QuotationValidityDate) QuotationValidityDate="";
        if (!QuotationPayTerm) QuotationPayTerm="";
        if (!QuotationDelivery) QuotationDelivery="";
        if (!QuotationRemark) QuotationRemark="";
        let PayTerm = JSON.stringify(QuotationPayTerm)
        let ValidityDateFilter = QuotationValidityDate.replace(/'/g, "''");
        let PayTermFilter = PayTerm.replace(/'/g, "''");
        let DeliveryFilter = QuotationDelivery.replace(/'/g, "''");
        let RemarkFilter = QuotationRemark.replace(/'/g, "''");
        let EndCustomerFilter = EndCustomer.replace(/'/g, "''");
        console.log(QuotationStatus)
        if (QuotationStatus == 1) { // not pre&cancel status
            res.status(400).send({message: "Cannot revise pre-quotation"});
        } else if(QuotationStatus == 5) {
            res.status(400).send({message: "Cannot revise cancel quotation"});
        } else {
            // InsertQuotationRevised
            let newRevise = QuotationRevised+1;
            console.log(newRevise)
            let InsertQuotation = `INSERT INTO Quotation(QuotationNoId, QuotationRevised, QuotationSubject, QuotationTotalPrice, QuotationDiscount, QuotationValidityDate, QuotationPayTerm, QuotationDelivery, QuotationRemark, QuotationUpdatedDate, EmployeeApproveId, EndCustomer)
            VALUES(${QuotationNoId}, ${newRevise}, N'${QuotationSubject}', ${QuotationTotalPrice}, ${QuotationDiscount}, N'${ValidityDateFilter}', N'${PayTermFilter}', N'${DeliveryFilter}', N'${RemarkFilter}', N'${checkDate()}', ${EmployeeApproveId}, N'${EndCustomerFilter}')
            SELECT SCOPE_IDENTITY() AS Id`;
            let Quotation = await pool.request().query(InsertQuotation);
            let NewQuotationId = Quotation.recordset[0].Id
            // Copy Item
            let selectOldItem = await pool.request().query(`SELECT * FROM QuotationItem WHERE QuotationId = ${OldQuotationId}`)
            for(const item of selectOldItem.recordset){
                let newItem = await pool.request().query(`INSERT INTO QuotationItem(QuotationId, ItemName, ItemPrice, ItemQty, ItemDescription)
                VALUES(${NewQuotationId}, N'${item.ItemName}', ${item.ItemPrice}, ${item.ItemQty}, N'${item.ItemDescription}')
                SELECT SCOPE_IDENTITY() AS Id`)
                let NewItemId = newItem.recordset[0].Id
                let selectOldSubItem = await pool.request().query(`SELECT * FROM QuotationSubItem WHERE ItemId = ${item.ItemId}`)
                for(const subitem of selectOldSubItem.recordset){
                    
                    await pool.request().query(`INSERT INTO QuotationSubItem(ItemId, ProductId, SubItemQty, SubItemUnit)
                    VALUES(${NewItemId}, ${subitem.ProductId}, ${subitem.SubItemQty}, N'${subitem.SubItemUnit}')`)
                }
            }
            console.log('copy success')
            res.status(200).send({message: 'Successfully revise quotation'});
        }
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

//set quotation status
router.get('/quotation/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId;
        let getQuotation = await pool.request().query(`SELECT a.QuotationNoId, a.QuotationRevised, a.QuotationStatus, b.CustomerId
        FROM [Quotation] a
        LEFT JOIN [QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
        WHERE QuotationId = ${QuotationId}`)
        let {QuotationNoId, QuotationRevised, QuotationStatus, CustomerId} = getQuotation.recordset[0];
        if (QuotationStatus == 1 && QuotationRevised == 0) {
            // GenQuotationNo
            let genQuotationNo = '';
            let CheckQuotationNo = await pool.request().query(`
                SELECT *
                FROM QuotationNo
                WHERE QuotationNo LIKE N'${checkMonth()}%'`)
            if (CheckQuotationNo.recordset.length<10) {
                genQuotationNo = checkMonth()+'0'+CheckQuotationNo.recordset.length
            } else {
                genQuotationNo = checkMonth()+CheckQuotationNo.recordset.length
            }
            console.log("Gen QuotationNo: " + genQuotationNo)
            // Insert QuotationNo
            let InsertQuotationNo = `INSERT INTO QuotationNo(QuotationNo,CustomerId) VALUES(N'${genQuotationNo}',${CustomerId})
                SELECT SCOPE_IDENTITY() AS Id`;
            let QuotationNo = await pool.request().query(InsertQuotationNo);
            let newQuotationNoId = QuotationNo.recordset[0].Id
            // Update Quotation NoId, Status & Delete pre-quotation no
            let UpdateQuotationStatus = `Update Quotation
                SET QuotationNoId = ${newQuotationNoId}, QuotationStatus = 2,
                QuotationDate = N'${checkDate()}', QuotationUpdatedDate = N'${checkDate()}'
                WHERE QuotationId = ${QuotationId}`;
            let DeletePreQuotationNo = `DELETE QuotationNo WHERE QuotationNoId = ${QuotationNoId} AND QuotationNo LIKE N'pre_%'`
            await pool.request().query(UpdateQuotationStatus);
            await pool.request().query(DeletePreQuotationNo);
            res.status(200).send({message: 'Successfully set quotation'});
        } else if ((QuotationStatus == 1 && QuotationRevised > 0) || QuotationStatus == 5 ) {
            // Update Quotation NoId, Status & Delete pre-quotation no
            let UpdateQuotationStatus = `Update Quotation
            SET QuotationStatus = 2, QuotationDate = N'${checkDate()}', QuotationUpdatedDate = N'${checkDate()}' WHERE QuotationId = ${QuotationId}`;
            let CancelQuotation = `Update Quotation SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkDate()}'
                WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId} AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`
            await pool.request().query(UpdateQuotationStatus);
            await pool.request().query(CancelQuotation);
            res.status(200).send({message: 'Successfully set quotation'});
        } else {
            res.status(400).send({message: 'Already quotation'});
        }
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

//set booking status
router.get('/booking/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId;
        let getQuotation = await pool.request().query(`SELECT QuotationNoId, QuotationStatus FROM Quotation WHERE QuotationId = ${QuotationId}`)
        let {QuotationNoId, QuotationStatus} = getQuotation.recordset[0];
        if (QuotationStatus != 3 && QuotationStatus != 1) {
            // Update Quotation NoId, Status & Delete pre-quotation no
            let UpdateQuotationStatus = `Update Quotation SET QuotationStatus = 3, QuotationUpdatedDate = N'${checkDate()}' WHERE QuotationId = ${QuotationId}`;
            let CancelQuotation = `Update Quotation SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkDate()}'
                WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId} AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`
            await pool.request().query(UpdateQuotationStatus);
            await pool.request().query(CancelQuotation);
            res.status(200).send({message: 'Successfully set quotation'});
        } else {
            res.status(400).send({message: 'Cannot booking pre-quotation'});
        }
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

//set loss status
router.get('/loss/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId;
        let getQuotation = await pool.request().query(`SELECT QuotationNoId, QuotationStatus FROM Quotation WHERE QuotationId = ${QuotationId}`)
        let {QuotationNoId, QuotationStatus} = getQuotation.recordset[0];
        if (QuotationStatus != 4 && QuotationStatus != 1) {
            // Update Quotation NoId, Status & Delete pre-quotation no
            let UpdateQuotationStatus = `Update Quotation SET QuotationStatus = 4, QuotationUpdatedDate = N'${checkDate()}' WHERE QuotationId = ${QuotationId}`;
            let CancelQuotation = `Update Quotation SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkDate()}'
                WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId} AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`
            await pool.request().query(UpdateQuotationStatus);
            await pool.request().query(CancelQuotation);
            res.status(200).send({message: 'Successfully set quotation'});
        } else {
            res.status(400).send({message: 'Cannot loss pre-quotation'});
        }
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

//set cancel status
router.get('/cancel/:QuotationId', async (req, res) => {
    try{
        let pool = await sql.connect(dbconfig);
        let QuotationId = req.params.QuotationId;
        let getQuotation = await pool.request().query(`SELECT QuotationStatus FROM Quotation WHERE QuotationId = ${QuotationId}`)
        let {QuotationStatus} = getQuotation.recordset[0];
        if (QuotationStatus != 5 && QuotationStatus != 1) {
            // Update Quotation NoId, Status & Delete pre-quotation no
            let UpdateQuotationStatus = `Update Quotation
            SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkDate()}' WHERE QuotationId = ${QuotationId}`;
            await pool.request().query(UpdateQuotationStatus);
            res.status(200).send({message: 'Successfully set quotation'});
        } else {
            res.status(400).send({message: 'Cannot cancel pre-quotation or canceled'});
        }
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

module.exports = router