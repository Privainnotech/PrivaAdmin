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
            EmployeeApproveId
        } = req.body
        if (QuotationPayTerm) QuotationPayTerm="";
        if (QuotationDelivery) QuotationDelivery="";
        if (QuotationRemark) QuotationRemark="";
        let PayTermFilter = QuotationPayTerm.replace(/'/g, "''");
        let DeliveryFilter = QuotationDelivery.replace(/'/g, "''");
        let RemarkFilter = QuotationRemark.replace(/'/g, "''");
        if (QuotationStatus > 1 && QuotationStatus < 5) { // not pre status
            // InsertQuotationRevised
            let newRevise = QuotationRevised+1;
            console.log(newRevise)
            let InsertQuotation = `INSERT INTO Quotation(QuotationNoId, QuotationRevised, QuotationSubject, QuotationTotalPrice, QuotationDiscount, QuotationValidityDate, QuotationPayTerm, QuotationDelivery, QuotationRemark, EmployeeApproveId)
            VALUES(${QuotationNoId}, ${newRevise}, N'${QuotationSubject}', ${QuotationTotalPrice}, ${QuotationDiscount}, ${QuotationValidityDate}, N'${PayTermFilter}', N'${DeliveryFilter}', N'${RemarkFilter}', ${EmployeeApproveId})
            SELECT SCOPE_IDENTITY() AS Id`;
            let Quotation = await pool.request().query(InsertQuotation);
            console.log('insert quo')
            let NewQuotationId = Quotation.recordset[0].Id
            // Copy Item
            let selectOldItem = await pool.request().query(`SELECT * FROM QuotationItem WHERE QuotationId = ${OldQuotationId}`)
            console.log('select old item')
            for(const item of selectOldItem.recordset){
                console.log('copy item')
                let newItem = await pool.request().query(`INSERT INTO QuotationItem(QuotationId, ItemName, ItemPrice, ItemQty, ItemDescription)
                VALUES(${NewQuotationId}, N'${item.ItemName}', ${item.ItemPrice}, ${item.ItemQty}, N'${item.ItemDescription}')
                SELECT SCOPE_IDENTITY() AS Id`)
                let NewItemId = newItem.recordset[0].Id
                let selectOldSubItem = await pool.request().query(`SELECT * FROM QuotationSubItem WHERE ItemId = ${item.ItemId}`)
                for(const subitem of selectOldSubItem.recordset){
                    console.log('copy subitem')
                    await pool.request().query(`INSERT INTO QuotationSubItem(ItemId, ProductId, SubItemQty, SubItemUnit)
                    VALUES(${NewItemId}, ${subitem.ProductId}, ${subitem.SubItemQty}, N'${subitem.SubItemUnit}')`)
                }
            }
            // Update old quotation status to cancel
            // await pool.request().query(`UPDATE Quotation SET QuotationStatus=5 WHERE QuotationId = ${OldQuotationId}`)
            res.status(200).send({message: 'Successfully revise quotation'});
        } else {
            res.status(400).send({message: "Cannot revise pre-quotation"});
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
        let getQuotation = await pool.request().query(`SELECT a.QuotationNoId a.QuotationStatus, b.CustomerId
        FROM [Quotation] a
        LEFT JOIN [QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
        WHERE QuotationId = ${QuotationId}`)
        let {QuotationNoId, QuotationStatus, CustomerId} = getQuotation.recordset[0];
        if (QuotationStatus == 1) {
            // GenQuotationNo
            let genQuotationNo = '';
            let CheckQuotationNo = await pool.request().query(`
                SELECT *
                FROM QuotationNo
                WHERE QuotationNo LIKE N'${checkDate()}%'`)
            if (CheckQuotationNo.recordset.length<10) {
                genQuotationNo = checkDate()+'0'+CheckQuotationNo.recordset.length
            } else {
                genQuotationNo = checkDate()+CheckQuotationNo.recordset.length
            }
            console.log("Gen QuotationNo: " + genQuotationNo)
            // Insert QuotationNo
            let InsertQuotationNo = `INSERT INTO QuotationNo(QuotationNo,CustomerId) VALUES(N'${genQuotationNo}',${CustomerId})
                SELECT SCOPE_IDENTITY() AS Id`;
            let QuotationNo = await pool.request().query(InsertQuotationNo);
            let newQuotationNoId = QuotationNo.recordset[0].Id
            // Update Quotation NoId, Status
            console.log(newQuotationNoId)
            let UpdateQuotationStatus = `Update Quotation
            SET QuotationNoId = ${newQuotationNoId}, QuotationStatus = 2
            WHERE QuotationId = ${QuotationId}`;
            await pool.request().query(UpdateQuotationStatus);
            let DeletePreQuotationNo = `DELETE QuotationNo WHERE QuotationNoId = ${QuotationNoId}`
            await pool.request().query(DeletePreQuotationNo);
            res.status(200).send({message: 'Successfully set quotation'});
        } else {
            res.status(400).send({message: 'Already quotation'});
        }
    } catch(err){
        res.status(500).send({message : `${err}`});
    }
})

module.exports = router