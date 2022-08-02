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
        let UserId = req.session.UserId;
        let OldQuotationId = req.params.OldQuotationId;
        let {
            QuotationNoId, QuotationSubject,
            QuotationStatus,
            QuotationTotalPrice,
            QuotationDiscount,
            QuotationValidityDate,
            QuotationPayTerm,
            QuotationDelivery,
            QuotationRemark,
            QuotationDetail,
            EmployeeApproveId,
            EndCustomer
        } = req.body
        if (!EndCustomer) EndCustomer="-";
        if (!QuotationValidityDate) QuotationValidityDate="-";
        if (!QuotationPayTerm) QuotationPayTerm="-";
        if (!QuotationDelivery) QuotationDelivery="-";
        if (!QuotationRemark) QuotationRemark="-";
        let Detail;
        if (!QuotationDetail) {
            Detail = null;
        } else {
            Detail = JSON.stringify(QuotationDetail);
        }
        let PayTerm = JSON.stringify(QuotationPayTerm);
        console.log(QuotationStatus)
        if (QuotationStatus == 1) { // not pre status
            res.status(400).send({message: "Cannot revise pre-quotation"});
        } else {
            // InsertQuotationRevised
            let getRevise = await pool.request().query(`SELECT COUNT(a.QuotationId) as Revised FROM Quotation a
            LEFT JOIN QuotationNo b ON a.QuotationNoId = b.QuotationNoId
            WHERE a.QuotationNoId = ${QuotationNoId} AND NOT a.QuotationStatus = 1`);
            let newRevise = getRevise.recordset[0].Revised;
            // let newRevise = QuotationRevised+1;
            console.log(newRevise)
            let InsertQuotation = `INSERT INTO Quotation(QuotationNoId, QuotationRevised, QuotationSubject, QuotationTotalPrice, QuotationDiscount, QuotationValidityDate, QuotationPayTerm, QuotationDelivery, QuotationRemark, QuotationDetail, QuotationUpdatedDate, EmployeeApproveId, EmployeeEditId, EndCustomer)
            VALUES(${QuotationNoId}, ${newRevise}, N'${QuotationSubject}', ${QuotationTotalPrice}, ${QuotationDiscount}, N'${QuotationValidityDate}', N'${PayTerm}', N'${QuotationDelivery}', N'${QuotationRemark}', N'${Detail}', N'${checkDate()}', ${EmployeeApproveId}, ${UserId}, N'${EndCustomer}')
            SELECT SCOPE_IDENTITY() AS Id`;
            let Quotation = await pool.request().query(InsertQuotation);
            let NewQuotationId = Quotation.recordset[0].Id
            // Copy Setting
            let getSetting = await pool.request().query(`SELECT * FROM QuotationSetting
            WHERE QuotationId = ${OldQuotationId}`);
            let {
                TableShow, TablePrice, TableQty, TableTotal
            } = getSetting.recordset[0]
            await pool.request().query(`INSERT INTO QuotationSetting(QuotationId, TableShow, TablePrice, TableQty, TableTotal)
            VALUES(${NewQuotationId}, ${TableShow}, ${TablePrice}, ${TableQty}, ${TableTotal})
            SELECT SCOPE_IDENTITY() AS Id`);
            // Copy Item
            let selectOldItem = await pool.request().query(`SELECT * FROM QuotationItem WHERE QuotationId = ${OldQuotationId}`)
            for(const item of selectOldItem.recordset){
                let newItem = await pool.request().query(`INSERT INTO QuotationItem(QuotationId, ItemName, ItemPrice, ItemQty, ItemDescription)
                VALUES(${NewQuotationId}, N'${item.ItemName}', ${item.ItemPrice}, ${item.ItemQty}, N'${item.ItemDescription}')
                SELECT SCOPE_IDENTITY() AS Id`)
                let NewItemId = newItem.recordset[0].Id
                let selectOldSubItem = await pool.request().query(`SELECT * FROM QuotationSubItem WHERE ItemId = ${item.ItemId}`)
                for(const subitem of selectOldSubItem.recordset){
                    
                    await pool.request().query(`INSERT INTO QuotationSubItem(ItemId, ProductId, SubItemPrice, SubItemQty, SubItemUnit)
                    VALUES(${NewItemId}, ${subitem.ProductId}, ${subitem.SubItemPrice}, ${subitem.SubItemQty}, N'${subitem.SubItemUnit}')`)
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
        let checkItem = await pool.request().query(`SELECT CASE
        WHEN EXISTS(
            SELECT *
            FROM QuotationItem
            WHERE QuotationId = ${QuotationId}
        )
        THEN CAST (1 AS BIT)
        ELSE CAST (0 AS BIT) END AS 'check'`)
        if(!checkItem.recordset[0].check){
            res.status(400).send({message: 'Cannot quotation with 0 item'});
        } else {
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
                    SET QuotationStatus = 2, QuotationNoId = ${newQuotationNoId},
                    QuotationDate = N'${checkDate()}', QuotationUpdatedDate = N'${checkDate()}'
                    WHERE QuotationId = ${QuotationId}`;
                let DeletePreQuotationNo = `DELETE QuotationNo WHERE QuotationNoId = ${QuotationNoId} AND QuotationNo LIKE N'pre_%'`
                await pool.request().query(UpdateQuotationStatus);
                await pool.request().query(DeletePreQuotationNo);
                res.status(200).send({message: 'Successfully set quotation'});
            } else if (QuotationStatus == 1 && QuotationRevised > 0) {
                let getRevise = await pool.request().query(`SELECT COUNT(a.QuotationId) as Revised FROM Quotation a
                LEFT JOIN QuotationNo b ON a.QuotationNoId = b.QuotationNoId
                WHERE a.QuotationNoId = ${QuotationNoId} AND NOT a.QuotationStatus = 1`);
                let newRevise = getRevise.recordset[0].Revised;
                // let newRevise = QuotationRevised+1;
                console.log(newRevise)
                // Update Quotation NoId, Status & cancel other quotation
                let UpdateQuotationStatus = `Update Quotation
                SET QuotationRevised = ${newRevise}, QuotationStatus = 2, QuotationDate = N'${checkDate()}', QuotationUpdatedDate = N'${checkDate()}' WHERE QuotationId = ${QuotationId}`;
                let CancelQuotation = `Update Quotation SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkDate()}'
                    WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId} AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`
                await pool.request().query(UpdateQuotationStatus);
                await pool.request().query(CancelQuotation);
                res.status(200).send({message: 'Successfully set quotation'});
            } else if ( QuotationStatus == 2 ) {
                res.status(400).send({message: 'Already quotation'});
            } else {
                // Update Quotation NoId, Status & cancel other quotation
                let UpdateQuotationStatus = `Update Quotation
                SET QuotationStatus = 2, QuotationDate = N'${checkDate()}', QuotationUpdatedDate = N'${checkDate()}' WHERE QuotationId = ${QuotationId}`;
                let CancelQuotation = `Update Quotation SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkDate()}'
                    WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId} AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`
                await pool.request().query(UpdateQuotationStatus);
                await pool.request().query(CancelQuotation);
                res.status(200).send({message: 'Successfully set quotation'});
            }
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