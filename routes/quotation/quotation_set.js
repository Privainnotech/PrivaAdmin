const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../config');

const { checkDate, checkTime } = require('../../libs/datetime');
const {
  quotationNoGenerate,
  preQuotationNoGenerate,
} = require('../../libs/utils');
const { checkStatus } = require('../modules/quotation');

const isParichart = async (UserId) => {
  let pool = await sql.connect(dbconfig);
  let getUser = await pool.request().query(
    `SELECT EmployeeFname
      FROM privanet.MasterEmployee WHERE EmployeeId = ${UserId}`
  );
  return getUser.recordset[0].EmployeeFname == 'Parichart' || true;
};

const cancelOther = async (QuotationId) => {
  let pool = await sql.connect(dbconfig);
  let Quotation = await pool
    .request()
    .query(
      `SELECT QuotationNoId FROM privanet.Quotation WHERE QuotationId = ${QuotationId}`
    );
  const { QuotationNoId } = Quotation.recordset[0];
  let CancelQuotation = `Update privanet.Quotation
  SET QuotationStatus = 5, QuotationUpdatedDate = N'${checkTime()}'
  WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationId = ${QuotationId}
  AND NOT QuotationStatus = 5 AND NOT QuotationStatus = 1`;
  await pool.request().query(CancelQuotation);
  return;
};

const getRevise = async (QuotationNoId) => {
  let pool = await sql.connect(dbconfig);
  let getRevise = await pool.request()
    .query(`SELECT COUNT(QuotationId) as Revised FROM privanet.Quotation 
      WHERE QuotationNoId = ${QuotationNoId} AND NOT QuotationStatus = 1`);
  return getRevise.recordset[0].Revised;
};

const copyQuotation = async (OldQuotationId, UserId, Type = 'copy') => {
  let pool = await sql.connect(dbconfig);
  let Oldquotations = await pool.request().query(`SELECT *
      FROM privanet.[Quotation] WHERE QuotationId = ${OldQuotationId}`);
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
  } = Oldquotations.recordset[0];
  if (!EndCustomer) EndCustomer = '-';
  if (!QuotationValidityDate) QuotationValidityDate = '-';
  if (!QuotationPayTerm) QuotationPayTerm = '-';
  if (!QuotationDelivery) QuotationDelivery = '-';
  if (!QuotationRemark) QuotationRemark = '-';
  let Detail = !QuotationDetail ? null : QuotationDetail;

  let newQuotationNoId = QuotationNoId;
  let newRevise = 0;
  if (Type == 'copy') {
    // Copy create new quotation no
    const genQuotationNo = await preQuotationNoGenerate();
    let InsertQuotationNo = `INSERT INTO privanet.QuotationNo(QuotationNo,CustomerId)
        VALUES(N'${genQuotationNo}', ${CustomerId}) SELECT SCOPE_IDENTITY() AS Id`;
    let QuotationNo = await pool.request().query(InsertQuotationNo);
    console.log('Quotation NO');
    newQuotationNoId = QuotationNo.recordset[0].Id;
  } else {
    // Revise create new revise quotation
    newRevise = getRevise(QuotationNoId);
  }

  // Insert Quotation
  let InsertQuotation = `INSERT INTO privanet.Quotation(
      QuotationNoId, QuotationRevised, QuotationSubject, QuotationTotalPrice,
      QuotationDiscount, QuotationValidityDate, QuotationPayTerm,
      QuotationDelivery, QuotationRemark, QuotationDetail, QuotationUpdatedDate,
      EmployeeApproveId, EmployeeEditId, EndCustomer, CustomerId
    )
    VALUES(${newQuotationNoId}, ${newRevise}, N'${QuotationSubject}', ${QuotationTotalPrice}, ${QuotationDiscount}, N'${QuotationValidityDate}', N'${QuotationPayTerm}', N'${QuotationDelivery}', N'${QuotationRemark}', N'${Detail}', N'${checkTime()}', ${EmployeeApproveId}, ${UserId}, N'${EndCustomer}',${CustomerId})
    SELECT SCOPE_IDENTITY() AS Id`;
  let Quotation = await pool.request().query(InsertQuotation);
  let NewQuotationId = Quotation.recordset[0].Id;

  // Copy PayTerm
  let selectOldPayterm = await pool.request().query(`SELECT QuotationId,
    IndexPayTerm, PayTerm, PayPercent, FORMAT(PayForecast,'yyyy-MM-dd') PayForecast
    FROM privanet.QuotationPayTerm WHERE QuotationId = ${OldQuotationId}`);
  for (const payterm of selectOldPayterm.recordset)
    await pool.request().query(`INSERT INTO privanet.QuotationPayTerm
      (QuotationId, IndexPayTerm, PayTerm, PayPercent, PayForecast)
      VALUES(${NewQuotationId}, ${payterm.IndexPayTerm}, N'${payterm.PayTerm}', ${payterm.PayPercent}, N'${payterm.PayForecast}')
      SELECT SCOPE_IDENTITY() AS Id`);

  // Copy Setting
  let getSetting = await pool.request().query(`SELECT *
    FROM privanet.QuotationSetting WHERE QuotationId = ${OldQuotationId}`);
  let { TableShow, TablePrice, TableQty, TableTotal } = getSetting.recordset[0];
  await pool.request().query(`INSERT INTO privanet.QuotationSetting
      (QuotationId, TableShow, TablePrice, TableQty, TableTotal)
    VALUES(${NewQuotationId}, ${TableShow}, ${TablePrice}, ${TableQty}, ${TableTotal})
    SELECT SCOPE_IDENTITY() AS Id`);

  // Copy Item
  let selectOldItem = await pool.request().query(`SELECT *
    FROM privanet.QuotationItem WHERE QuotationId = ${OldQuotationId}`);
  for (const item of selectOldItem.recordset) {
    let newItem = await pool.request().query(`INSERT INTO privanet.QuotationItem
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
  return;
};

const updateStatus = async (QuotationId, QuotationStatus) => {
  let pool = await sql.connect(dbconfig);
  let UpdateQuotationStatus = `Update privanet.Quotation
    SET QuotationStatus = ${QuotationStatus}, QuotationUpdatedDate = N'${checkTime()}'
    WHERE QuotationId = ${QuotationId}`;
  await pool.request().query(UpdateQuotationStatus);
  return;
};

//copy quotation
router.get('/copy/:OldQuotationId', async (req, res) => {
  try {
    let UserId = req.session.UserId;
    if (UserId == '') return res.status(400).send({ message: 'Please login' });

    let OldQuotationId = req.params.OldQuotationId;
    await copyQuotation(OldQuotationId, UserId);
    res.status(200).send({ message: 'Successfully copy quotation' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//revised quotation
router.get('/revise/:OldQuotationId', async (req, res) => {
  try {
    let UserId = req.session.UserId;
    if (UserId == '') return res.status(400).send({ message: 'Please login' });

    let OldQuotationId = req.params.OldQuotationId;
    const status = checkStatus(OldQuotationId);
    // Check Reject
    if (status == 1)
      return res.status(400).send({ message: 'Cannot revise pre-quotation' });
    if (status == 0)
      return res
        .status(400)
        .send({ message: 'Cannot revise invoiced quotation' });
    if (status == 3)
      return res
        .status(400)
        .send({ message: 'Cannot revise booking quotation' });

    await copyQuotation(OldQuotationId, UserId, 'revise');
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

    let checkItem = await pool.request().query(`SELECT CASE
      WHEN EXISTS(
        SELECT *
        FROM privanet.QuotationItem
        WHERE QuotationId = ${QuotationId}
      )
      THEN CAST (1 AS BIT)
      ELSE CAST (0 AS BIT) END AS 'check'`);
    if (!checkItem.recordset[0].check)
      return res.status(400).send({ message: 'Cannot quotation without item' });

    let getQuotation = await pool.request().query(`SELECT
      a.QuotationNoId, a.QuotationRevised, a.QuotationStatus,
      b.CustomerId, a.EmployeeApproveId, a.QuotationApproval
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      WHERE QuotationId = ${QuotationId}`);
    let { EmployeeApproveId, QuotationApproval } = getQuotation.recordset[0];
    if (EmployeeApproveId === null)
      return res
        .status(400)
        .send({ message: 'Cannot quotation without approver' });
    if (QuotationApproval !== 2)
      return res
        .status(400)
        .send({ message: 'Cannot quotation without approved' });

    let { QuotationNoId, QuotationRevised, QuotationStatus, CustomerId } =
      getQuotation.recordset[0];
    if (QuotationStatus == 2)
      return res.status(400).send({ message: 'Already quotation' });

    if (QuotationStatus == 1 && QuotationRevised == 0) {
      // GenQuotationNo
      let genQuotationNo = await quotationNoGenerate();
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
    } else if (QuotationStatus == 1 && QuotationRevised > 0) {
      let newRevise = getRevise(QuotationNoId);
      // Update privanet.Quotation NoId, Status & cancel other quotation
      let UpdateQuotationStatus = `Update privanet.Quotation
          SET QuotationRevised = ${newRevise}, QuotationStatus = 2,
          QuotationDate = N'${checkDate()}', QuotationUpdatedDate = N'${checkTime()}'
          WHERE QuotationId = ${QuotationId}`;
      await pool.request().query(UpdateQuotationStatus);
    } else {
      // Update privanet.Quotation NoId, Status & cancel other quotation
      let UpdateQuotationStatus = `Update privanet.Quotation
          SET QuotationStatus = 2, QuotationDate = N'${checkDate()}',
          QuotationUpdatedDate = N'${checkTime()}'
          WHERE QuotationId = ${QuotationId}`;
      await pool.request().query(UpdateQuotationStatus);
    }
    cancelOther(QuotationId);
    res.status(200).send({ message: 'Successfully set quotation' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set booking status
router.get('/booking/:QuotationId', async (req, res) => {
  try {
    let UserId = req.session.UserId;
    if (!(await isParichart(UserId)))
      return res
        .status(401)
        .send({ message: 'Only Parichart can set booking' });

    let QuotationId = req.params.QuotationId;
    const status = checkStatus(QuotationId);
    if (status == 3 || status == 1)
      res.status(400).send({ message: 'Cannot booking pre-quotation' });

    await updateStatus(QuotationId, 3);
    cancelOther(QuotationId);

    res.status(200).send({ message: 'Successfully set booking' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set q-booking status
router.get('/q-booking/:QuotationId', async (req, res) => {
  try {
    let UserId = req.session.UserId;
    if (!(await isParichart(UserId)))
      return res
        .status(401)
        .send({ message: 'Only Parichart can set booking' });

    let QuotationId = req.params.QuotationId;
    const status = checkStatus(QuotationId);
    if (status == 6 || status == 1)
      res.status(400).send({ message: 'Cannot booking pre-quotation' });

    await updateStatus(QuotationId, 6);
    cancelOther(QuotationId);

    res.status(200).send({ message: 'Successfully set q-booking' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set loss status
router.get('/loss/:QuotationId', async (req, res) => {
  try {
    let QuotationId = req.params.QuotationId;
    const status = checkStatus(QuotationId);
    if (status == 4 || status == 1)
      res.status(400).send({ message: 'Cannot loss pre-quotation' });

    await updateStatus(QuotationId, 4);
    cancelOther(QuotationId);

    res.status(200).send({ message: 'Successfully set loss' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//set cancel status
router.get('/cancel/:QuotationId', async (req, res) => {
  try {
    let QuotationId = req.params.QuotationId;
    const status = checkStatus(QuotationId);
    if (status == 5 || status == 1)
      res
        .status(400)
        .send({ message: 'Cannot cancel pre-quotation or canceled' });

    await updateStatus(QuotationId, 5);

    res.status(200).send({ message: 'Successfully cancel' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

module.exports = router;
