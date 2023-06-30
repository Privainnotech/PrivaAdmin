const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../config');

const { checkMonth, checkDate, checkTime } = require('../../libs/datetime');
const { quotationNoGenerate } = require('../../libs/utils');

//copy quotation
router.get('/copy/:OldQuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    if (UserId == '') {
      res.status(400).send({ message: 'Please login' });
      return;
    }
    let OldQuotationId = req.params.OldQuotationId;
    let getOldQuotation = `SELECT * FROM privanet.[Quotation] WHERE QuotationId = ${OldQuotationId}`;
    let Oldquotations = await pool.request().query(getOldQuotation);
    let Oldquotation = Oldquotations.recordset[0];
    let {
      QuotationNoId,
      CustomerId,
      QuotationSubject,
      EndCustomer,
      QuotationTotalPrice,
      QuotationDiscount,
      QuotationValidityDate,
      QuotationPayTerm,
      QuotationDelivery,
      QuotationRemark,
      QuotationDetail,
      EmployeeApproveId,
    } = Oldquotation;
    if (!EndCustomer) EndCustomer = '-';
    if (!QuotationValidityDate) QuotationValidityDate = '-';
    if (!QuotationPayTerm) QuotationPayTerm = '-';
    if (!QuotationDelivery) QuotationDelivery = '-';
    if (!QuotationRemark) QuotationRemark = '-';
    let Detail = !QuotationDetail ? null : QuotationDetail;
    const genQuotationNo = await quotationNoGenerate();
    // Insert QuotationNo
    let InsertQuotationNo = `INSERT INTO privanet.QuotationNo(QuotationNo,CustomerId)
      VALUES(N'${genQuotationNo}', ${CustomerId}) SELECT SCOPE_IDENTITY() AS Id`;
    let QuotationNo = await pool.request().query(InsertQuotationNo);
    console.log('Quotation NO');
    let newQuotationNoId = QuotationNo.recordset[0].Id;
    // Insert QuotationCopy
    let InsertQuotation = `INSERT INTO privanet.Quotation(
        QuotationNoId, QuotationSubject, QuotationTotalPrice,
        QuotationDiscount, QuotationValidityDate, QuotationPayTerm,
        QuotationDelivery, QuotationRemark, QuotationDetail, QuotationUpdatedDate,
        EmployeeApproveId, EmployeeEditId, EndCustomer, CustomerId
      )
      VALUES(${newQuotationNoId}, N'${QuotationSubject}', ${QuotationTotalPrice}, ${QuotationDiscount}, N'${QuotationValidityDate}', N'${QuotationPayTerm}', N'${QuotationDelivery}', N'${QuotationRemark}', N'${Detail}', N'${checkTime()}', ${EmployeeApproveId}, ${UserId}, N'${EndCustomer}',${CustomerId})
      SELECT SCOPE_IDENTITY() AS Id`;
    let Quotation = await pool.request().query(InsertQuotation);
    let NewQuotationId = Quotation.recordset[0].Id;
    // Copy PayTerm
    let selectOldPayterm = await pool.request()
      .query(`SELECT QuotationId, IndexPayTerm, PayTerm, PayPercent,
      FORMAT(PayForecast,'yyyy-MM-dd') PayForecast FROM privanet.QuotationPayTerm
      WHERE QuotationId = ${OldQuotationId}`);
    for (const payterm of selectOldPayterm.recordset)
      await pool.request().query(`INSERT INTO privanet.QuotationPayTerm
      (QuotationId, IndexPayTerm, PayTerm, PayPercent, PayForecast)
      VALUES(${NewQuotationId}, ${payterm.IndexPayTerm}, N'${payterm.PayTerm}', ${payterm.PayPercent}, N'${payterm.PayForecast}')
      SELECT SCOPE_IDENTITY() AS Id`);

    // Copy Setting
    let getSetting = await pool.request().query(`SELECT *
      FROM privanet.QuotationSetting
      WHERE QuotationId = ${OldQuotationId}`);
    let { TableShow, TablePrice, TableQty, TableTotal } =
      getSetting.recordset[0];
    await pool.request().query(`INSERT INTO privanet.QuotationSetting
        (QuotationId, TableShow, TablePrice, TableQty, TableTotal)
      VALUES(${NewQuotationId}, ${TableShow}, ${TablePrice}, ${TableQty}, ${TableTotal})
      SELECT SCOPE_IDENTITY() AS Id`);
    // Copy Item
    let selectOldItem = await pool.request()
      .query(`SELECT * FROM privanet.QuotationItem
      WHERE QuotationId = ${OldQuotationId}`);
    for (const item of selectOldItem.recordset) {
      let newItem = await pool.request()
        .query(`INSERT INTO privanet.QuotationItem
          (QuotationId, ItemName, ItemPrice, ItemQty)
            VALUES(${NewQuotationId}, N'${item.ItemName}', ${item.ItemPrice}, ${item.ItemQty})
            SELECT SCOPE_IDENTITY() AS Id`);
      let NewItemId = newItem.recordset[0].Id;
      let selectOldSubItem = await pool.request().query(
        `SELECT * FROM privanet.QuotationSubItem
            WHERE ItemId = ${item.ItemId}`
      );
      for (const subitem of selectOldSubItem.recordset) {
        await pool.request().query(`INSERT INTO privanet.QuotationSubItem
            (ItemId, ProductId, SubItemName, SubItemPrice, SubItemQty, SubItemUnit)
            VALUES(${NewItemId}, ${subitem.ProductId}, N'${subitem.SubItemName}',
            ${subitem.SubItemPrice}, ${subitem.SubItemQty}, N'${subitem.SubItemUnit}')`);
      }
    }
    console.log('revise success');
    res.status(200).send({ message: 'Successfully revise quotation' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//revised quotation
router.get('/revise/:OldQuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    if (UserId == '') {
      res.status(400).send({ message: 'Please login' });
      return;
    }
    let OldQuotationId = req.params.OldQuotationId;
    let getOldQuotation = `SELECT
        b.QuotationNoId, a.QuotationStatus, a.QuotationSubject, a.EndCustomer,
        a.QuotationTotalPrice, a.QuotationDiscount,
        CONVERT(nvarchar(max), a.QuotationValidityDate) AS 'QuotationValidityDate',
        CONVERT(nvarchar(max), a.QuotationPayTerm) AS 'QuotationPayTerm',
        CONVERT(nvarchar(max), a.QuotationDelivery) AS 'QuotationDelivery',
        CONVERT(nvarchar(max), a.QuotationRemark) AS 'QuotationRemark',
        CONVERT(nvarchar(max), a.QuotationDetail) AS 'QuotationDetail',
        a.CustomerId, a.EmployeeApproveId
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      WHERE a.QuotationId = ${OldQuotationId}`;
    let Oldquotations = await pool.request().query(getOldQuotation);
    let Oldquotation = Oldquotations.recordset[0];
    let {
      QuotationNoId,
      CustomerId,
      QuotationSubject,
      QuotationStatus,
      EndCustomer,
      QuotationTotalPrice,
      QuotationDiscount,
      QuotationValidityDate,
      QuotationPayTerm,
      QuotationDelivery,
    } = Oldquotation;
    let { QuotationRemark, QuotationDetail, EmployeeApproveId } = Oldquotation;
    if (!EndCustomer) EndCustomer = '-';
    if (!QuotationValidityDate) QuotationValidityDate = '-';
    if (!QuotationPayTerm) QuotationPayTerm = '-';
    if (!QuotationDelivery) QuotationDelivery = '-';
    if (!QuotationRemark) QuotationRemark = '-';
    let Detail = !QuotationDetail ? null : QuotationDetail;
    if (QuotationStatus == 1)
      return res.status(400).send({ message: 'Cannot revise pre-quotation' });
    if (QuotationStatus == 0)
      return res
        .status(400)
        .send({ message: 'Cannot revise invoiced quotation' });
    if (QuotationStatus == 3)
      return res
        .status(400)
        .send({ message: 'Cannot revise booking quotation' });
    // InsertQuotationRevised
    let getRevise = await pool.request()
      .query(`SELECT COUNT(a.QuotationId) as Revised FROM privanet.Quotation a
        LEFT JOIN privanet.QuotationNo b ON a.QuotationNoId = b.QuotationNoId
        WHERE a.QuotationNoId = ${QuotationNoId} AND NOT a.QuotationStatus = 1`);
    let newRevise = getRevise.recordset[0].Revised;
    // let newRevise = QuotationRevised+1;
    console.log('Revised: ' + newRevise);
    let InsertQuotation = `INSERT INTO privanet.Quotation(
        QuotationNoId, QuotationRevised, QuotationSubject, QuotationTotalPrice,
        QuotationDiscount, QuotationValidityDate, QuotationPayTerm,
        QuotationDelivery, QuotationRemark, QuotationDetail, QuotationUpdatedDate,
        EmployeeApproveId, EmployeeEditId, EndCustomer, CustomerId
      )
      VALUES(${QuotationNoId}, ${newRevise}, N'${QuotationSubject}', ${QuotationTotalPrice}, ${QuotationDiscount}, N'${QuotationValidityDate}', N'${QuotationPayTerm}', N'${QuotationDelivery}', N'${QuotationRemark}', N'${Detail}', N'${checkTime()}', ${EmployeeApproveId}, ${UserId}, N'${EndCustomer}',${CustomerId})
      SELECT SCOPE_IDENTITY() AS Id`;
    let Quotation = await pool.request().query(InsertQuotation);
    let NewQuotationId = Quotation.recordset[0].Id;
    // Copy PayTerm
    let selectOldPayterm = await pool.request()
      .query(`SELECT QuotationId, IndexPayTerm, PayTerm, PayPercent,
      FORMAT(PayForecast,'yyyy-MM-dd') PayForecast FROM privanet.QuotationPayTerm
      WHERE QuotationId = ${OldQuotationId}`);
    for (const payterm of selectOldPayterm.recordset)
      await pool.request().query(`INSERT INTO privanet.QuotationPayTerm
      (QuotationId, IndexPayTerm, PayTerm, PayPercent, PayForecast)
      VALUES(${NewQuotationId}, ${payterm.IndexPayTerm}, N'${payterm.PayTerm}', ${payterm.PayPercent}, N'${payterm.PayForecast}')
      SELECT SCOPE_IDENTITY() AS Id`);

    // Copy Setting
    let getSetting = await pool.request().query(`SELECT *
      FROM privanet.QuotationSetting
      WHERE QuotationId = ${OldQuotationId}`);
    let { TableShow, TablePrice, TableQty, TableTotal } =
      getSetting.recordset[0];
    await pool.request().query(`INSERT INTO privanet.QuotationSetting
        (QuotationId, TableShow, TablePrice, TableQty, TableTotal)
      VALUES(${NewQuotationId}, ${TableShow}, ${TablePrice}, ${TableQty}, ${TableTotal})
      SELECT SCOPE_IDENTITY() AS Id`);
    // Copy Item
    let selectOldItem = await pool.request()
      .query(`SELECT * FROM privanet.QuotationItem
      WHERE QuotationId = ${OldQuotationId}`);
    for (const item of selectOldItem.recordset) {
      let newItem = await pool.request()
        .query(`INSERT INTO privanet.QuotationItem
          (QuotationId, ItemName, ItemPrice, ItemQty)
            VALUES(${NewQuotationId}, N'${item.ItemName}', ${item.ItemPrice}, ${item.ItemQty})
            SELECT SCOPE_IDENTITY() AS Id`);
      let NewItemId = newItem.recordset[0].Id;
      let selectOldSubItem = await pool.request().query(
        `SELECT * FROM privanet.QuotationSubItem
            WHERE ItemId = ${item.ItemId}`
      );
      for (const subitem of selectOldSubItem.recordset) {
        await pool.request().query(`INSERT INTO privanet.QuotationSubItem
            (ItemId, ProductId, SubItemName, SubItemPrice, SubItemQty, SubItemUnit)
            VALUES(${NewItemId}, ${subitem.ProductId}, N'${subitem.SubItemName}',
            ${subitem.SubItemPrice}, ${subitem.SubItemQty}, N'${subitem.SubItemUnit}')`);
      }
    }
    console.log('revise success');
    res.status(200).send({ message: 'Successfully revise quotation' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set quotation status
router.get('/quotation/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotation = await pool.request().query(`SELECT
      a.QuotationNoId, a.QuotationRevised, a.QuotationStatus,
      b.CustomerId, a.EmployeeApproveId, a.QuotationApproval
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      WHERE QuotationId = ${QuotationId}`);
    let { EmployeeApproveId, QuotationApproval } = getQuotation.recordset[0];
    if (EmployeeApproveId === null) {
      res.status(400).send({ message: 'Cannot quotation without approver' });
      return;
    }
    if (QuotationApproval !== 2) {
      res.status(400).send({ message: 'Cannot quotation without approved' });
      return;
    }
    let checkItem = await pool.request().query(`SELECT CASE
      WHEN EXISTS(
        SELECT *
        FROM privanet.QuotationItem
        WHERE QuotationId = ${QuotationId}
      )
      THEN CAST (1 AS BIT)
      ELSE CAST (0 AS BIT) END AS 'check'`);
    if (!checkItem.recordset[0].check) {
      res.status(400).send({ message: 'Cannot quotation without item' });
    } else {
      let { QuotationNoId, QuotationRevised, QuotationStatus, CustomerId } =
        getQuotation.recordset[0];
      if (QuotationStatus == 1 && QuotationRevised == 0) {
        // GenQuotationNo
        let month = checkMonth();
        let genQuotationNo = '';
        let SearchQuotationNo = await pool.request().query(`SELECT *
          FROM privanet.QuotationNo WHERE QuotationNo LIKE N'${month}%'`);
        // Check QuotationNo
        let duplicateNo = true;
        let Number = SearchQuotationNo.recordset.length;
        do {
          if (Number < 10) {
            genQuotationNo = month + '00' + Number;
          } else if (Number < 100) {
            genQuotationNo = month + '0' + Number;
          } else {
            genQuotationNo = month + Number;
          }
          let CheckQuotationNo = await pool.request().query(`SELECT CASE
            WHEN EXISTS(
              SELECT *
              FROM privanet.QuotationNo
              WHERE QuotationNo = N'${genQuotationNo}'
            )
            THEN CAST (1 AS BIT)
            ELSE CAST (0 AS BIT) END AS 'check'`);
          duplicateNo = CheckQuotationNo.recordset[0].check;
          if (duplicateNo) {
            Number++;
          }
        } while (duplicateNo);
        console.log('Gen QuotationNo: ' + genQuotationNo);
        // Insert QuotationNo
        let InsertQuotationNo = `INSERT INTO privanet.QuotationNo
          (QuotationNo,CustomerId)
          VALUES(N'${genQuotationNo}',${CustomerId})
          SELECT SCOPE_IDENTITY() AS Id`;
        let QuotationNo = await pool.request().query(InsertQuotationNo);
        let newQuotationNoId = QuotationNo.recordset[0].Id;
        // Update Quotation NoId, Status & Delete pre-quotation no
        let UpdateQuotationStatus = `Update privanet.Quotation
          SET QuotationStatus = 2, QuotationNoId = ${newQuotationNoId},
          QuotationDate = N'${checkDate()}', QuotationUpdatedDate = N'${checkTime()}'
          WHERE QuotationId = ${QuotationId}`;
        let DeletePreQuotationNo = `DELETE FROM privanet.QuotationNo WHERE QuotationNoId = ${QuotationNoId} AND QuotationNo LIKE N'pre_%'`;
        await pool.request().query(UpdateQuotationStatus);
        await pool.request().query(DeletePreQuotationNo);
        res.status(200).send({ message: 'Successfully set quotation' });
      } else if (QuotationStatus == 1 && QuotationRevised > 0) {
        let getRevise = await pool.request().query(`SELECT
          COUNT(a.QuotationId) as Revised
          FROM privanet.Quotation a
          LEFT JOIN privanet.QuotationNo b ON a.QuotationNoId = b.QuotationNoId
          WHERE a.QuotationNoId = ${QuotationNoId} AND NOT a.QuotationStatus = 1`);
        let newRevise = getRevise.recordset[0].Revised;
        // let newRevise = QuotationRevised+1;
        console.log('Revised: ' + newRevise);
        // Update privanet.Quotation NoId, Status & cancel other quotation
        let UpdateQuotationStatus = `Update privanet.Quotation
          SET QuotationRevised = ${newRevise}, QuotationStatus = 2,
          QuotationDate = N'${checkDate()}', QuotationUpdatedDate = N'${checkTime()}'
          WHERE QuotationId = ${QuotationId}`;
        let CancelQuotation = `Update privanet.Quotation 
          SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkTime()}'
          WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId}
          AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`;
        await pool.request().query(UpdateQuotationStatus);
        await pool.request().query(CancelQuotation);
        res.status(200).send({ message: 'Successfully set quotation' });
      } else if (QuotationStatus == 2) {
        res.status(400).send({ message: 'Already quotation' });
      } else {
        // Update privanet.Quotation NoId, Status & cancel other quotation
        let UpdateQuotationStatus = `Update privanet.Quotation
          SET QuotationStatus = 2, QuotationDate = N'${checkDate()}',
          QuotationUpdatedDate = N'${checkTime()}'
          WHERE QuotationId = ${QuotationId}`;
        let CancelQuotation = `Update privanet.Quotation
          SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkTime()}'
          WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId}
          AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`;
        await pool.request().query(UpdateQuotationStatus);
        await pool.request().query(CancelQuotation);
        res.status(200).send({ message: 'Successfully set quotation' });
      }
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set booking status
router.get('/booking/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    let getUser = await pool.request().query(
      `SELECT EmployeeFname
        FROM privanet.MasterEmployee WHERE EmployeeId = ${UserId}`
    );
    if (getUser.recordset[0].EmployeeFname !== 'Parichart')
      return res
        .status(401)
        .send({ message: 'Only Parichart can set booking' });
    let QuotationId = req.params.QuotationId;
    let getQuotation = await pool.request().query(
      `SELECT QuotationNoId, QuotationStatus
        FROM privanet.Quotation WHERE QuotationId = ${QuotationId}`
    );
    let { QuotationNoId, QuotationStatus } = getQuotation.recordset[0];
    if (QuotationStatus != 3 && QuotationStatus != 1) {
      // Update privanet.Quotation NoId, Status & Delete pre-quotation no
      let UpdateQuotationStatus = `Update privanet.Quotation
        SET QuotationStatus = 3, QuotationUpdatedDate = N'${checkTime()}'
        WHERE QuotationId = ${QuotationId}`;
      let CancelQuotation = `Update privanet.Quotation
        SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkTime()}'
        WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId}
        AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`;
      await pool.request().query(UpdateQuotationStatus);
      await pool.request().query(CancelQuotation);
      res.status(200).send({ message: 'Successfully set quotation' });
    } else {
      res.status(400).send({ message: 'Cannot booking pre-quotation' });
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set q-booking status
router.get('/q-booking/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    let getUser = await pool.request().query(
      `SELECT EmployeeFname
        FROM privanet.MasterEmployee WHERE EmployeeId = ${UserId}`
    );
    if (getUser.recordset[0].EmployeeFname !== 'Parichart')
      return res
        .status(401)
        .send({ message: 'Only Parichart can set q-booking' });
    let QuotationId = req.params.QuotationId;
    let getQuotation = await pool.request().query(
      `SELECT QuotationNoId, QuotationStatus
        FROM privanet.Quotation WHERE QuotationId = ${QuotationId}`
    );
    let { QuotationNoId, QuotationStatus } = getQuotation.recordset[0];
    if (QuotationStatus != 6 && QuotationStatus != 1) {
      // Update privanet.Quotation NoId, Status & Delete pre-quotation no
      let UpdateQuotationStatus = `Update privanet.Quotation
        SET QuotationStatus = 6, QuotationUpdatedDate = N'${checkTime()}'
        WHERE QuotationId = ${QuotationId}`;
      let CancelQuotation = `Update privanet.Quotation
        SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkTime()}'
        WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId}
        AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`;
      await pool.request().query(UpdateQuotationStatus);
      await pool.request().query(CancelQuotation);
      res.status(200).send({ message: 'Successfully set quotation' });
    } else {
      res.status(400).send({ message: 'Cannot booking pre-quotation' });
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set loss status
router.get('/loss/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotation = await pool.request().query(
      `SELECT QuotationNoId, QuotationStatus
        FROM privanet.Quotation WHERE QuotationId = ${QuotationId}`
    );
    let { QuotationNoId, QuotationStatus } = getQuotation.recordset[0];
    if (QuotationStatus != 4 && QuotationStatus != 1) {
      // Update privanet.Quotation NoId, Status & Delete pre-quotation no
      let UpdateQuotationStatus = `Update privanet.Quotation
        SET QuotationStatus = 4, QuotationUpdatedDate = N'${checkTime()}' 
        WHERE QuotationId = ${QuotationId}`;
      let CancelQuotation = `Update privanet.Quotation
        SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkTime()}'
        WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId}
        AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`;
      await pool.request().query(UpdateQuotationStatus);
      await pool.request().query(CancelQuotation);
      res.status(200).send({ message: 'Successfully set quotation' });
    } else {
      res.status(400).send({ message: 'Cannot loss pre-quotation' });
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set cancel status
router.get('/cancel/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotation = await pool.request().query(
      `SELECT QuotationStatus FROM privanet.Quotation
        WHERE QuotationId = ${QuotationId}`
    );
    let { QuotationStatus } = getQuotation.recordset[0];
    if (QuotationStatus != 5 && QuotationStatus != 1) {
      // Update privanet.Quotation NoId, Status & Delete pre-quotation no
      let UpdateQuotationStatus = `Update privanet.Quotation
        SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkTime()}'
        WHERE QuotationId = ${QuotationId}`;
      await pool.request().query(UpdateQuotationStatus);
      res.status(200).send({ message: 'Successfully set quotation' });
    } else {
      res
        .status(400)
        .send({ message: 'Cannot cancel pre-quotation or canceled' });
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

module.exports = router;
