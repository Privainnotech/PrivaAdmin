const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../config');

const { checkMonth, checkDate, checkTime } = require('../../libs/datetime');
const { PriceS, PriceI, PriceQ } = require('../modules/price');
const {
  preQuotationNoGenerate,
  invoiceNoGenerate,
} = require('../../libs/utils');
const { checkStatus } = require('../modules/quotation');

/* ----------- QUOTATION ----------- */
router.get('/quotation_no_list', async (req, res, next) => {
  try {
    let getQuotationNoList = `SELECT
        row_number() over(order by 
          (
            SELECT TOP 1 QuotationUpdatedDate FROM privanet.[Quotation] h
            WHERE h.QuotationNoId = a.QuotationNoId ORDER BY QuotationStatus,QuotationRevised desc
          ) desc, a.QuotationNo desc) as 'index',
        a.QuotationNoId, a.QuotationNo, a.CustomerId, b.CustomerName,
        b.CompanyId,c.CompanyName,
        (SELECT TOP 1 QuotationSubject
          FROM privanet.[Quotation] d
          WHERE d.QuotationNoId = a.QuotationNoId
          ORDER BY QuotationStatus,QuotationRevised desc ) QuotationSubject,
        (SELECT TOP 1 QuotationRevised
          FROM privanet.[Quotation] e
          WHERE e.QuotationNoId = a.QuotationNoId
          ORDER BY QuotationStatus,QuotationRevised desc ) QuotationRevised,
        (SELECT TOP 1 f.CustomerId
          FROM privanet.[Quotation] f
          WHERE f.QuotationNoId = a.QuotationNoId
          ORDER BY QuotationStatus,QuotationRevised desc ) CustomerIdQ,
        (SELECT TOP 1 QuotationNet
          FROM privanet.[Quotation] g
          WHERE g.QuotationNoId = a.QuotationNoId
          ORDER BY QuotationStatus,QuotationRevised desc ) QuotationNet,
        (SELECT TOP 1 QuotationUpdatedDate
          FROM privanet.[Quotation] h
          WHERE h.QuotationNoId = a.QuotationNoId
          ORDER BY QuotationStatus,QuotationRevised desc ) QuotationUpdatedDate,
        (SELECT TOP 1 j.StatusName
          FROM privanet.[Quotation] i
          LEFT JOIN privanet.[MasterStatus] j on i.QuotationStatus = j.StatusId
          WHERE i.QuotationNoId = a.QuotationNoId
          ORDER BY QuotationStatus,QuotationRevised desc) StatusName,
        (SELECT TOP 1 QuotationId
          FROM privanet.[Quotation] k
          WHERE k.QuotationNoId = a.QuotationNoId
          ORDER BY QuotationStatus,QuotationRevised desc ) QuotationId
      FROM privanet.[QuotationNo] a
      LEFT JOIN privanet.[MasterCustomer] b ON a.CustomerId = b.CustomerId
      LEFT JOIN privanet.[MasterCompany] c ON b.CompanyId = c.CompanyId
      WHERE NOT b.CustomerName = N'Fake'`;
    // WHERE NOT b.CustomerName = N'Fake'
    let pool = await sql.connect(dbconfig);
    let quotationNos = await pool.request().query(getQuotationNoList);
    for (let i = 0; i < quotationNos.recordset.length; i++) {
      let { QuotationId, CustomerIdQ, StatusName } = quotationNos.recordset[i];
      if (StatusName == 'Invoice') {
        let getPayterm = `SELECT SUM(PayPercent) TotalInvoice
          FROM privanet.QuotationPayTerm
          WHERE QuotationId = ${QuotationId} AND PayInvoiced = 1;`;
        let payterms = await pool.request().query(getPayterm);
        let { TotalInvoice } = payterms.recordset[0];
        quotationNos.recordset[i].StatusName += ` ${TotalInvoice}%`;
      }
      if (!CustomerIdQ) continue;
      let getCustomer = await pool.request()
        .query(`SELECT a.CustomerName,b.CompanyName
        FROM privanet.[MasterCustomer] a
        LEFT JOIN privanet.[MasterCompany] b on a.CompanyId = b.CompanyId
        WHERE CustomerId = ${CustomerIdQ}`);
      let { CustomerName, CompanyName } = getCustomer.recordset[0];
      if (CompanyName == 'Fake') {
        quotationNos.recordset.splice(i, 1);
        i--;
        continue;
      }
      quotationNos.recordset[i].CustomerName = CustomerName;
      quotationNos.recordset[i].CompanyName = CompanyName;

      let pos = await pool.request().query(`SELECT PONo
        FROM privanet.[QuotationPO] WHERE QuotationId = ${QuotationId}`);
      quotationNos.recordset[i].PO = pos.recordset;
    }
    res.status(200).send(JSON.stringify(quotationNos.recordset));
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});
router.get('/quotation_list/:QuotationNoId', async (req, res, next) => {
  try {
    let { QuotationNoId } = req.params;
    let getQuotationList = `SELECT
        row_number() over(
          order by a.QuotationStatus,a.QuotationRevised desc,a.QuotationUpdatedDate desc
        ) as 'index',
        b.QuotationNoId, a.QuotationId, a.QuotationStatus, b.QuotationNo,
        a.QuotationRevised, a.QuotationSubject,a.QuotationNet,
        FORMAT(a.QuotationDate, 'dd-MM-yyyy') QuotationDate,
        FORMAT(a.QuotationUpdatedDate, 'dd-MM-yyyy HH:mm') QuotationUpdatedDate,
        c.StatusName, a.EmployeeApproveId, d.EmployeeFname, a.QuotationApproval
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN privanet.[MasterStatus] c ON a.QuotationStatus = c.StatusId
      LEFT JOIN privanet.[MasterEmployee] d ON a.EmployeeEditId = d.EmployeeId
      WHERE a.QuotationNoId = ${QuotationNoId}`;
    let pool = await sql.connect(dbconfig);
    let quotations = await pool.request().query(getQuotationList);
    for (let Quotation of quotations.recordset) {
      let { QuotationId, StatusName } = Quotation;
      if (StatusName == 'Invoice') {
        let getPayterm = `SELECT SUM(PayPercent) TotalInvoice
          FROM privanet.QuotationPayTerm
          WHERE QuotationId = ${QuotationId} AND PayInvoiced = 1;`;
        let payterms = await pool.request().query(getPayterm);
        let { TotalInvoice } = payterms.recordset[0];
        Quotation.StatusName += ` ${TotalInvoice}%`;
      }
    }
    // console.log(quotations.recordset);
    res.status(200).send(JSON.stringify(quotations.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});
router.get('/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotation = `SELECT
        b.QuotationNoId, b.QuotationNo, a.QuotationRevised, a.QuotationStatus, d.StatusName,
        a.CustomerId, c.CustomerName, c.CustomerEmail,f.CompanyName, f.CompanyAddress,
        a.QuotationId, a.QuotationSubject, a.EndCustomer,
        FORMAT(a.QuotationDate, 'dd-MM-yyyy') QuotationDate,
        FORMAT(a.QuotationUpdatedDate, 'dd-MM-yyyy HH:mm') QuotationUpdatedDate,
        a.QuotationTotalPrice, a.QuotationDiscount, a.QuotationNet,
        a.QuotationVat, a.QuotationNetVat,
        CONVERT(nvarchar(max), a.QuotationValidityDate) AS 'QuotationValidityDate',
        CONVERT(nvarchar(max), a.QuotationPayTerm) AS 'QuotationPayTerm',
        CONVERT(nvarchar(max), a.QuotationDelivery) AS 'QuotationDelivery',
        CONVERT(nvarchar(max), a.QuotationRemark) AS 'QuotationRemark',
        CONVERT(nvarchar(max), a.QuotationDetail) AS 'QuotationDetail',
        a.EmployeeApproveId, e.EmployeeFname + ' ' + e.EmployeeLname EmployeeName,
        e.EmployeeEmail, e.EmployeePosition, a.QuotationApproval,
        g.TableShow, g.TablePrice, g.TableQty, g.TableTotal
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN privanet.[MasterCustomer] c ON a.CustomerId = c.CustomerId
      LEFT JOIN privanet.[MasterStatus] d ON a.QuotationStatus = d.StatusId
      LEFT JOIN privanet.[MasterEmployee] e ON a.EmployeeApproveId = e.EmployeeId
      LEFT JOIN privanet.[MasterCompany] f ON c.CompanyId = f.CompanyId
      LEFT JOIN privanet.[QuotationSetting] g ON a.QuotationId = g.QuotationId
      WHERE a.QuotationId = ${QuotationId}`;
    let quotations = await pool.request().query(getQuotation);
    let getPayterm = `SELECT PayTerm,PayPercent,FORMAT(PayForecast, 'yyyy-MM-dd') PayForecast, PayInvoiced
      FROM privanet.QuotationPayTerm WHERE QuotationId = ${QuotationId} ORDER BY IndexPayTerm;`;
    let payterms = await pool.request().query(getPayterm);
    let getPO = `SELECT POId, PONo,FORMAT(PODate, 'yyyy-MM-dd') PODate FROM privanet.[QuotationPO] WHERE QuotationId = ${QuotationId}`;
    let pos = await pool.request().query(getPO);

    let quotation = quotations.recordset[0];
    let {
      QuotationNo,
      QuotationRevised,
      QuotationPayTerm,
      EmployeeApproveId,
      QuotationDetail,
    } = quotation;
    let Revised =
      QuotationRevised < 10
        ? '0' + QuotationRevised.toString()
        : QuotationRevised.toString();
    quotation.QuotationNo_Revised = `${QuotationNo}_${Revised}`;

    if (!QuotationPayTerm || !QuotationPayTerm.includes('QuotationPayTerm'))
      quotation.QuotationPayTerm = '';
    else {
      let PaytermArr = [];
      QuotationPayTerm = JSON.parse(QuotationPayTerm);
      for (let [key, value] of Object.entries(QuotationPayTerm)) {
        if (value) PaytermArr.push({ PayTerm: value, PayPercent: 0 });
      }
      quotation.QuotationPayTerm = PaytermArr;
    }

    if (!EmployeeApproveId) quotation.EmployeeApproveId = '';
    if (QuotationDetail) {
      if (QuotationDetail[0] == '<')
        quotation.QuotationDetail = QuotationDetail;
      else {
        QuotationDetail = JSON.parse(QuotationDetail);
        let Details = '';
        if (!QuotationDetail || QuotationDetail == 'null')
          quotation.QuotationDetail = '';
        else {
          QuotationDetail.blocks.forEach((block) => {
            let { data } = block;
            Details += `<p>${data.text}</p>`;
          });
          quotation.QuotationDetail = Details;
        }
      }
    } else quotation.QuotationDetail = '';

    quotation.QuotationRevised = Revised;
    let PayTermArr = new Array();
    for (let idx = 0; idx < payterms.recordset.length; idx++) {
      let { PayTerm, PayPercent, PayForecast, PayInvoiced } =
        payterms.recordset[idx];
      PayTermArr.push({ PayTerm, PayPercent, PayForecast, PayInvoiced });
    }
    if (PayTermArr.length) quotation.QuotationPayTerm = PayTermArr;
    quotation.PO = pos.recordset;
    res.status(200).send(JSON.stringify(quotation));
  } catch (err) {
    console.log(`${err}`);
    res.status(500).send({ message: `${err}` });
  }
});

router.post('/add_pre_quotation', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    let { QuotationSubject, CustomerId } = req.body;
    if (!UserId) return res.status(400).send({ message: 'Please login' });
    if (QuotationSubject == '')
      return res.status(400).send({ message: 'Please enter Project name' });
    if (CustomerId == '')
      return res.status(400).send({ message: 'Please select Customer' });
    // Generate QuotationNo
    const PreQuotationNo = await preQuotationNoGenerate();
    // Insert QuotationNo
    let InsertQuotationNo = `INSERT INTO privanet.QuotationNo(QuotationNo,CustomerId)
      VALUES(N'${PreQuotationNo}', ${CustomerId}) SELECT SCOPE_IDENTITY() AS Id`;
    let QuotationNo = await pool.request().query(InsertQuotationNo);
    console.log('Quotation NO');
    let QuotationNoId = QuotationNo.recordset[0].Id;
    // Insert Quotation with QuotationNoId
    let InsertQuotation = `INSERT INTO privanet.Quotation(
        QuotationNoId,CustomerId, QuotationSubject, QuotationUpdatedDate, EmployeeEditId
      )
      VALUES(${QuotationNoId}, ${CustomerId}, N'${QuotationSubject}', N'${checkTime()}', ${UserId})
      SELECT SCOPE_IDENTITY() AS Id`;
    let Quotation = await pool.request().query(InsertQuotation);
    console.log('Quotation');
    let QuotationId = Quotation.recordset[0].Id;
    await pool
      .request()
      .query(
        `INSERT INTO privanet.QuotationSetting(QuotationId) VALUES(${QuotationId})`
      );
    console.log('Quotation Setting');
    res.status(201).send({ message: 'Successfully add Quotation' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});
router.put('/edit_quotation/:QuotationId', async (req, res) => {
  try {
    console.log('call edit');
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    if (!UserId) return res.status(400).send({ message: 'Please login' });
    let QuotationId = req.params.QuotationId;
    let { QuotationSubject, QuotationValidityDate, CustomerId } = req.body;
    let { QuotationPayTerm, QuotationDelivery, QuotationDiscount } = req.body;
    let { QuotationRemark, EmployeeApproveId, EndCustomer } = req.body;
    console.log(QuotationPayTerm);
    if (!CustomerId)
      return res.status(400).send({ message: 'Please select Customer' });
    if (!EmployeeApproveId)
      return res.status(400).send({ message: 'Please select Approver' });
    if (!QuotationPayTerm.length)
      return res.status(400).send({ message: 'Please add Term of Payment' });
    let QuotationPayLength = QuotationPayTerm.length;
    for (let idx = 0; idx < QuotationPayLength; idx++) {
      let { PayTerm, Percent, PayForecast } = QuotationPayTerm[idx];
      if (!PayTerm || !Percent || !PayForecast)
        return res
          .status(400)
          .send({ message: 'Please fill every field in Term of Payment' });
    }
    let ValidityDateFilter = QuotationValidityDate.replace(/'/g, "''");
    let DeliveryFilter = QuotationDelivery.replace(/'/g, "''");
    let RemarkFilter = QuotationRemark.replace(/'/g, "''");
    let EndCustomerFilter = EndCustomer.replace(/'/g, "''");
    // Update Quotation
    // console.log(QuotationPayTerm);
    if (Array.isArray(QuotationPayTerm)) {
      // Array
      let UpdateQuotation = `UPDATE privanet.Quotation
        SET QuotationSubject = N'${QuotationSubject}', CustomerId = ${CustomerId},
          QuotationDiscount=${
            parseFloat(QuotationDiscount.replaceAll(',', '')) || 0
          },
          QuotationValidityDate = N'${ValidityDateFilter}', QuotationDelivery = N'${DeliveryFilter}',
          QuotationRemark = N'${RemarkFilter}', EmployeeApproveId = ${EmployeeApproveId},
          EndCustomer = N'${EndCustomerFilter}', EmployeeEditId = ${UserId}
        WHERE QuotationId = ${QuotationId};`;
      await pool.request().query(UpdateQuotation);
      for (let idx = 0; idx < QuotationPayLength; idx++) {
        let { PayTerm, Percent, PayForecast } = QuotationPayTerm[idx];
        let checkPayTerm = await pool.request().query(`SELECT IndexPayTerm
          FROM privanet.QuotationPayTerm WHERE QuotationId = ${QuotationId} AND IndexPayTerm = ${
          idx + 1
        }`);
        console.log(checkPayTerm.recordset.length);
        if (checkPayTerm.recordset.length) {
          console.log('update');
          await pool.request().query(`UPDATE privanet.QuotationPayTerm
          SET PayTerm = N'${PayTerm}', PayPercent = ${
            Percent || 0
          }, PayForecast = N'${PayForecast}'
          WHERE QuotationId = ${QuotationId} AND IndexPayTerm = ${idx + 1};`);
        } else {
          console.log('insert');
          await pool.request().query(`INSERT INTO privanet.QuotationPayTerm
          (QuotationId,IndexPayTerm,PayTerm,PayPercent,PayForecast)
          VALUES(${QuotationId},${idx + 1},N'${PayTerm}',${
            Percent || 0
          },N'${PayForecast}');`);
        }
      }
      let checkPayTermLength = await pool.request()
        .query(`SELECT COUNT(IndexPayTerm) PayTermLength
        FROM privanet.QuotationPayTerm WHERE QuotationId = ${QuotationId}`);
      let { PayTermLength } = checkPayTermLength.recordset[0];
      for (let idx = 0; idx < PayTermLength - QuotationPayLength; idx++)
        await pool.request().query(`DELETE FROM privanet.QuotationPayTerm
          WHERE QuotationId = ${QuotationId} AND IndexPayTerm = ${
          PayTermLength - idx
        };`);
    } else {
      // JSON
      let PayTerm = JSON.stringify(QuotationPayTerm);
      let PayTermFilter = PayTerm.replace(/'/g, "''");
      let UpdateQuotation = `UPDATE privanet.Quotation
        SET QuotationSubject = N'${QuotationSubject}', CustomerId = ${CustomerId},
          QuotationDiscount = ${
            QuotationDiscount || 0
          }, QuotationValidityDate = N'${ValidityDateFilter}',
          QuotationPayTerm = N'${PayTermFilter}', QuotationDelivery = N'${DeliveryFilter}',
          QuotationRemark = N'${RemarkFilter}', EmployeeApproveId = ${EmployeeApproveId},
          EndCustomer = N'${EndCustomerFilter}', EmployeeEditId = ${UserId}
        WHERE QuotationId = ${QuotationId};`;
      await pool.request().query(UpdateQuotation);
    }
    res.status(201).send({ message: 'Successfully Edit Quotation' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});
router.put('/edit_payforecast/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let UserId = req.session.UserId;
    if (!UserId) return res.status(400).send({ message: 'Please login' });
    let QuotationId = req.params.QuotationId;
    let { QuotationPayTerm } = req.body;
    let QuotationPayLength = QuotationPayTerm.length;
    for (let idx = 0; idx < QuotationPayLength; idx++) {
      let { PayForecast } = QuotationPayTerm[idx];
      if (!PayForecast)
        return res
          .status(400)
          .send({ message: 'Please fill Payment Forecast' });
    }
    // Update Quotation
    let quotation = await pool.request()
      .query(`SELECT CONVERT(nvarchar(max), QuotationPayTerm) AS 'OldPayTerm'
      FROM privanet.[Quotation] WHERE QuotationId = ${QuotationId}`);
    let { OldPayTerm } = quotation.recordset[0];
    let InvoicePercent = 0;
    if (OldPayTerm != '-') {
      OldPayTerm = JSON.parse(OldPayTerm);
      for (let idx = 0; idx < QuotationPayLength; idx++) {
        let { PayForecast, PayInvoiced } = QuotationPayTerm[idx];
        let getPayterm = `SELECT PayTerm,PayPercent
          FROM privanet.QuotationPayTerm WHERE QuotationId = ${QuotationId} AND IndexPayTerm = ${
          idx + 1
        };`;
        let payterms = await pool.request().query(getPayterm);
        if (payterms.recordset.length) {
          console.log('new term');
          let { PayTerm, PayPercent } = payterms.recordset[0];
          if (PayPercent == 0) {
            let match = PayTerm.match(/\d+\s*%/);
            PayPercent = match ? parseFloat(match[0]) : 0;
            PayPercent = isNaN(PayPercent) ? 0 : PayPercent;
            PayTerm = PayTerm.replace(/\d+\s*%/, '');
          }
          if (!PayPercent && QuotationPayLength == 1) PayPercent = 100;
          if (PayInvoiced) InvoicePercent += PayPercent;
          await pool.request().query(`UPDATE privanet.QuotationPayTerm
          SET PayTerm = N'${PayTerm}',PayPercent = ${PayPercent},
            PayForecast = N'${PayForecast}',PayInvoiced = ${PayInvoiced}
          WHERE QuotationId = ${QuotationId} AND IndexPayTerm = ${idx + 1};`);
        } else {
          console.log('old term');
          let TempPayTerm = OldPayTerm[`QuotationPayTerm${idx + 1}`];
          let PayPercent = 0;
          let match = TempPayTerm.match(/\d+\s*%/);
          PayPercent = match ? parseFloat(match[0]) : 0;
          PayPercent = isNaN(PayPercent) ? 0 : PayPercent;
          TempPayTerm = TempPayTerm.replace(/\d+\s*%/, '');
          if (!PayPercent && QuotationPayLength == 1) PayPercent = 100;
          if (PayInvoiced) InvoicePercent += PayPercent;
          await pool.request().query(`INSERT INTO privanet.QuotationPayTerm
            (QuotationId,IndexPayTerm,PayTerm,PayPercent,PayForecast,PayInvoiced)
          VALUES(${QuotationId},${idx + 1},N'${TempPayTerm}',
            ${PayPercent},N'${PayForecast}',${PayInvoiced});`);
        }
      }
    } else {
      for (let idx = 0; idx < QuotationPayLength; idx++) {
        let { PayForecast, PayInvoiced } = QuotationPayTerm[idx];
        let getPayterm = `SELECT PayTerm,PayPercent
          FROM privanet.QuotationPayTerm WHERE QuotationId = ${QuotationId} AND IndexPayTerm = ${
          idx + 1
        };`;
        let payterms = await pool.request().query(getPayterm);
        if (payterms.recordset.length) {
          let { PayPercent } = payterms.recordset[0];
          if (!PayPercent && QuotationPayLength == 1) PayPercent = 100;
          if (PayInvoiced) InvoicePercent += PayPercent;
          await pool.request().query(`UPDATE privanet.QuotationPayTerm
          SET PayForecast = N'${PayForecast}', PayInvoiced = ${PayInvoiced}
          WHERE QuotationId = ${QuotationId} AND IndexPayTerm = ${idx + 1};`);
        }
      }
    }
    console.log(InvoicePercent);
    let getUser = await pool.request().query(
      `SELECT EmployeeFname
        FROM privanet.MasterEmployee WHERE EmployeeId = ${UserId}`
    );
    let getStatus = await pool.request()
      .query(`SELECT QuotationStatus FROM privanet.Quotation
      WHERE QuotationId = ${QuotationId}`);
    let status = getStatus.recordset[0].QuotationStatus;
    if (InvoicePercent) {
      if (status != 0) {
        if (getUser.recordset[0].EmployeeFname !== 'Parichart')
          return res
            .status(401)
            .send({ message: 'Only Parichart can set invoiced' });
      }
      await pool.request().query(`Update privanet.Quotation
        SET QuotationStatus = 0, QuotationUpdatedDate = N'${checkTime()}'
        WHERE QuotationId = ${QuotationId}`);
    } else {
      if (status == 0) {
        if (getUser.recordset[0].EmployeeFname !== 'Parichart')
          return res
            .status(401)
            .send({ message: 'Only Parichart can set invoiced' });
        await pool.request().query(`Update privanet.Quotation
        SET QuotationStatus = 3, QuotationUpdatedDate = N'${checkTime()}'
        WHERE QuotationId = ${QuotationId}`);
      }
    }
    res.status(201).send({ message: 'Successfully Edit Quotation' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});
router.put('/edit_detail/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let { QuotationDetail } = req.body;
    // console.log(QuotationDetail);
    let Detail = '';
    if (
      typeof QuotationDetail == 'object' &&
      QuotationDetail.blocks.length !== 0
    )
      Detail = JSON.stringify(QuotationDetail);
    else Detail = QuotationDetail == '<p><br></p>' ? '' : QuotationDetail;
    Detail = Detail.replaceAll('&nbsp;', ' ')
      .replaceAll("'", "''")
      .replaceAll('amp;', '&');
    console.log(Detail);
    let UpdateDetail = `UPDATE privanet.Quotation SET QuotationDetail = N'${Detail}' WHERE QuotationId = ${QuotationId};`;
    await pool.request().query(UpdateDetail);
    res.status(201).send({ message: 'Successfully Edit Quotation Detail' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});

router.delete('/delete_quotation/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let Status = await pool.request()
      .query(`SELECT QuotationStatus, QuotationRevised
      FROM privanet.Quotation WHERE QuotationId = ${QuotationId}`);
    if (Status.recordset[0].QuotationStatus != 1)
      return res.status(400).send({ message: 'Cannot delete quotation' });
    let selectItem = await pool
      .request()
      .query(
        `SELECT ItemId FROM privanet.QuotationItem WHERE QuotationId = ${QuotationId}`
      );
    if (selectItem.recordset.length)
      for (const item of selectItem.recordset) // Delete SubItem
        await pool
          .request()
          .query(
            `DELETE FROM privanet.QuotationSubItem WHERE ItemId=${item.ItemId}`
          );
    let DeleteQuotation = `DECLARE @QuotationNoId bigint;
      SET @QuotationNoId = (SELECT QuotationNoId FROM privanet.Quotation WHERE QuotationId =  ${QuotationId});
      DELETE FROM privanet.QuotationItem WHERE QuotationId=${QuotationId}
      DELETE FROM privanet.QuotationSetting WHERE QuotationId=${QuotationId}
      DELETE FROM privanet.Quotation WHERE QuotationId=${QuotationId}
      DELETE FROM privanet.QuotationNo WHERE QuotationNoId = @QuotationNoId AND QuotationNo LIKE N'pre_%'`;
    await pool.request().query(DeleteQuotation);
    res.status(200).send({ message: 'Successfully delete pre-quotation' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

/* ----------- ITEM ----------- */
router.get('/item/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotationItem = `SELECT row_number() over(order by a.ItemId) as 'Item',
      a.QuotationId, a.ItemId, a.ItemName,
      a.ItemPrice, a.ItemQty, b.QuotationStatus
      FROM privanet.[QuotationItem] a
      LEFT JOIN privanet.[Quotation] b on a.QuotationId = b.QuotationId
      WHERE a.QuotationId = ${QuotationId}`;
    let quotations = await pool.request().query(getQuotationItem);
    res.status(200).send(JSON.stringify(quotations.recordset));
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});
router.get('/subitem/:ItemId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let ItemId = req.params.ItemId;
    let getQuotationSubItem = `SELECT row_number() over(order by a.SubItemId) as 'Index',
      c.QuotationId, a.SubItemId, b.ProductId, b.ProductType, b.ProductCode,
      a.SubItemName, a.SubItemPrice, a.SubItemQty, a.SubItemUnit,
      CONVERT(nvarchar(10), a.SubItemQty)+' '+a.SubItemUnit SubItemQtyUnit
      FROM privanet.[QuotationSubItem] a
      LEFT JOIN privanet.[MasterProduct] b ON a.ProductId = b.ProductId
      LEFT JOIN privanet.[QuotationItem] c ON a.ItemId = c.ItemId
      WHERE a.ItemId = ${ItemId}`;
    let quotations = await pool.request().query(getQuotationSubItem);
    res.status(200).send(JSON.stringify(quotations.recordset));
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});

router.post('/add_item/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let { QuotationId } = req.params;
    let { ItemName, ItemPrice, ItemQty } = req.body;
    //Unit = {Pc, Set, Lot} => Dropdown
    if (ItemName == '')
      return res.status(400).send({ message: 'Please enter Item name' });
    if (ItemPrice == '') ItemPrice = 0;
    if (ItemQty == '') ItemQty = 0;
    let CheckQuotationItem = await pool.request().query(`SELECT CASE WHEN EXISTS
        (SELECT * FROM privanet.QuotationItem WHERE ItemName = N'${ItemName}' AND QuotationId = ${QuotationId})
      THEN CAST (1 AS BIT) ELSE CAST (0 AS BIT) END AS 'check'`);
    if (CheckQuotationItem.recordset[0].check)
      return res.status(400).send({ message: 'Duplicate item in quotation' });
    console.log('insert', QuotationId, ItemName, ItemPrice, ItemQty);
    let InsertItem = `INSERT INTO privanet.QuotationItem(QuotationId, ItemName, ItemPrice, ItemQty)
      VALUES(${QuotationId}, N'${ItemName}', ${ItemPrice}, ${ItemQty}) SELECT SCOPE_IDENTITY() AS Id`;
    let Item = await pool.request().query(InsertItem);
    if (!(ItemPrice === 0 || ItemQty === 0)) PriceQ(Item.recordset[0].Id);
    res.status(201).send({ message: 'Successfully add Item' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});
router.post('/add_subitem/:ItemId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let ItemId = req.params.ItemId;
    let { ProductId, ProductType, SubItemName } = req.body;
    let { SubItemPrice, SubItemQty, SubItemUnit } = req.body;
    // ProductType = {Labor, Material, Internal, Unknown} => Dropdown
    // Unit = {Pc, Set, Lot} => Dropdown
    if (SubItemName == '')
      return res.status(400).send({ message: 'Please enter description' });
    if (SubItemPrice == '') SubItemPrice = 0;
    if (SubItemQty == '') SubItemQty = 0;
    if (ProductId == '') {
      // Add new produc
      let CheckProduct = await pool.request().query(`SELECT CASE WHEN EXISTS
          (SELECT * FROM privanet.MasterProduct WHERE ProductName = N'${SubItemName}')
        THEN CAST (1 AS BIT) ELSE CAST (0 AS BIT) END AS 'check'`);
      if (CheckProduct.recordset[0].check) {
        let getProductId = await pool.request().query(`
          SELECT ProductId FROM privanet.MasterProduct WHERE ProductName = N'${SubItemName}'`);
        let ProductId = getProductId.recordset[0].ProductId;
        let CheckSubItem = await pool.request().query(`SELECT CASE WHEN EXISTS
            (SELECT * FROM privanet.QuotationSubItem  WHERE ProductId = ${ProductId} and ItemId = ${ItemId})
          THEN CAST (1 AS BIT) ELSE CAST (0 AS BIT) END AS 'check'`);
        if (CheckSubItem.recordset[0].check)
          return res.status(400).send({ message: 'Duplicate Sub-item' });
        let InsertSubItem = `INSERT INTO privanet.QuotationSubItem
          (ItemId, ProductId, SubItemName, SubItemPrice, SubItemQty, SubItemUnit)
          VALUES(${ItemId}, ${ProductId}, N'${SubItemName}', ${SubItemPrice},
            ${SubItemQty}, N'${SubItemUnit}')`;
        await pool.request().query(InsertSubItem);
        if (!(SubItemPrice === 0 || SubItemQty === 0)) PriceI(ItemId);
        res.status(201).send({ message: 'Sub-item has been added' });
      } else {
        let month = checkMonth();
        let ProductCode = '';
        let CheckProductCode = await pool.request().query(`
          SELECT * FROM privanet.MasterProduct WHERE ProductCode LIKE N'%${month}%'`);
        let length = CheckProductCode.recordset.length;
        if (length < 10)
          ProductCode = ProductType[0] + '_' + month + '00' + length;
        else if (length < 100)
          ProductCode = ProductType[0] + '_' + month + '0' + length;
        else ProductCode = ProductType[0] + '_' + month + length;
        console.log('Gen ProductCode: ' + ProductCode);
        let InsertProduct = `INSERT INTO privanet.MasterProduct(ProductCode, ProductName, ProductType)
          VALUES(N'${ProductCode}', N'${SubItemName}', N'${ProductType}') SELECT SCOPE_IDENTITY() AS Id`;
        let newProduct = await pool.request().query(InsertProduct);
        let InsertSubItem = `INSERT INTO privanet.QuotationSubItem
          (ItemId, ProductId, SubItemName, SubItemPrice, SubItemQty, SubItemUnit)
          VALUES(${ItemId}, ${newProduct.recordset[0].Id}, N'${SubItemName}', ${SubItemPrice},
            ${SubItemQty}, N'${SubItemUnit}')`;
        await pool.request().query(InsertSubItem);
        if (!(SubItemPrice === 0 || SubItemQty === 0)) PriceI(ItemId);
        res.status(201).send({ message: 'Sub-item has been added' });
      }
    } else {
      // Already have product
      let CheckSubItem = await pool.request().query(`SELECT CASE WHEN EXISTS
          (SELECT * FROM privanet.QuotationSubItem WHERE ProductId = ${ProductId} and ItemId = ${ItemId})
        THEN CAST (1 AS BIT) ELSE CAST (0 AS BIT) END AS 'check'`);
      if (CheckSubItem.recordset[0].check)
        return res.status(400).send({ message: 'Duplicate Sub-item' });
      let InsertSubItem = `INSERT INTO privanet.QuotationSubItem
        (ItemId, ProductId, SubItemName, SubItemPrice,SubItemQty, SubItemUnit)
        VALUES(${ItemId}, ${ProductId}, N'${SubItemName}', ${SubItemPrice}, N'${SubItemQty}', N'${SubItemUnit}')`;
      await pool.request().query(InsertSubItem);
      if (!(SubItemPrice === 0 || SubItemQty === 0)) PriceI(ItemId);
      res.status(201).send({ message: 'Sub-item has been added' });
    }
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put('/edit_item/:ItemId', async (req, res) => {
  try {
    let ItemId = req.params.ItemId;
    let { ItemName, ItemPrice, ItemQty } = req.body;
    if (ItemName == '')
      return res.status(400).send({ message: 'Please enter Item name' });
    if (ItemPrice === '') ItemPrice = 0;
    if (ItemQty === '') ItemQty = 0;
    let pool = await sql.connect(dbconfig);
    let UpdateQuotationItem = `UPDATE privanet.QuotationItem
      SET ItemName = N'${ItemName}', ItemPrice = ${ItemPrice},
      ItemQty = ${ItemQty}
      WHERE ItemId = ${ItemId}`;
    await pool.request().query(UpdateQuotationItem);
    if (!(ItemPrice === 0 || ItemQty === 0)) PriceQ(ItemId);
    res.status(200).send({ message: 'Successfully Edit Item' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});
router.put('/edit_subitem/:SubItemId', async (req, res) => {
  try {
    let SubItemId = req.params.SubItemId;
    console.log(SubItemId);
    let { SubItemName, SubItemPrice, SubItemQty, SubItemUnit } = req.body;
    console.log(req.body);
    if (SubItemName == '')
      return res.status(400).send({ message: 'Please enter description' });
    if (SubItemPrice === '') SubItemPrice = 0;
    if (SubItemQty === '') SubItemQty = 0;
    let pool = await sql.connect(dbconfig);
    let UpdateQuotationSubItem = `UPDATE privanet.QuotationSubItem
      SET SubItemName = N'${SubItemName}', SubItemPrice = ${SubItemPrice},
      SubItemQty = ${SubItemQty}, SubItemUnit =N'${SubItemUnit}'
      WHERE SubItemId = ${SubItemId}`;
    await pool.request().query(UpdateQuotationSubItem);
    if (!(SubItemPrice === 0 || SubItemQty === 0)) PriceS(SubItemId);
    res.status(200).send({ message: 'Successfully Edit Sub-Item' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});
router.put('/edit_setting/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let { TableShow, TablePrice, TableQty, TableTotal } = req.body;
    let UpdateSetting = `UPDATE privanet.QuotationSetting
      SET TableShow = ${TableShow}, TablePrice = ${TablePrice},
        TableQty = ${TableQty},  TableTotal = ${TableTotal}
      WHERE QuotationId = ${QuotationId};`;
    await pool.request().query(UpdateSetting);
    res.status(201).send({ message: 'Quotation Setting Updated' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.delete('/delete_item/:ItemId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let { ItemId } = req.params;
    let DeleteItem = `DECLARE @QuotationId bigint;
      SET @QuotationId = (SELECT QuotationId FROM privanet.QuotationItem WHERE ItemId =  ${ItemId});
      DELETE FROM privanet.QuotationSubItem WHERE ItemId = ${ItemId};
      UPDATE privanet.QuotationItem
        SET ItemQty = 0 WHERE ItemId = ${ItemId};
      UPDATE privanet.Quotation
      SET QuotationTotalPrice = (
        SELECT SUM(ItemQty * ItemPrice) FROM privanet.QuotationItem WHERE QuotationId = @QuotationId)
        WHERE QuotationId = @QuotationId;
      DELETE FROM privanet.QuotationItem WHERE ItemId=${ItemId}`;
    await pool.request().query(DeleteItem);
    res.status(200).send({ message: 'Successfully delete Item' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});
router.delete('/delete_subitem/:SubItemId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let { SubItemId } = req.params;
    let DeleteSubItem = `DECLARE @QuotationId bigint, @ItemId bigint;
      SET @ItemId = (SELECT ItemId FROM privanet.QuotationSubItem WHERE SubItemId = ${SubItemId});
      SET @QuotationId = (SELECT QuotationId FROM privanet.QuotationItem WHERE ItemId = @ItemId);
      DELETE FROM privanet.QuotationSubItem WHERE SubItemId = ${SubItemId};
      UPDATE privanet.QuotationItem
      SET ItemPrice = (SELECT CASE
        WHEN EXISTS(
          SELECT *
          FROM privanet.QuotationSubItem
          WHERE ItemId = @ItemId
        )
        THEN CAST ((SELECT SUM(SubItemQty * SubItemPrice) 
          FROM privanet.QuotationSubItem 
          WHERE ItemId = @ItemId) as int)
        ELSE CAST (0 as int) END)
      WHERE ItemId = @ItemId;
      UPDATE privanet.Quotation
      SET QuotationTotalPrice = (SELECT SUM(ItemQty * ItemPrice) 
        FROM privanet.QuotationItem 
        WHERE QuotationId = @QuotationId)
      WHERE QuotationId = @QuotationId;`;
    await pool.request().query(DeleteSubItem);
    res.status(200).send({ message: 'Successfully delete Sub-item' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

/* ----------- PO & Invoice ----------- */
router.post('/add_po/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    const status = await checkStatus(QuotationId);
    console.log(status);
    if (status != 3 && status != 4 && status != 0)
      return res
        .status(400)
        .send({ message: 'Cannot update PO for non-booking quotation' });

    let { PONo, PODate } = req.body;
    console.log(req.body);
    if (PONo == '' || PODate == '')
      return res.status(400).send({ message: 'Please enter PO no and date' });

    const InsertPO = `INSERT INTO privanet.QuotationPo(QuotationId, PONo, PODate) VALUES(${QuotationId}, N'${PONo}', N'${PODate}')`;
    await pool.request().query(InsertPO);
    res.status(201).send({ message: 'PO has been added' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.put('/edit_po/:POId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let POId = req.params.POId;
    const Quotation = await pool
      .request()
      .query(
        `SELECT QuotationId FROM privanet.QuotationPO WHERE POId = ${POId}`
      );
    const status = await checkStatus(Quotation.recordset[0].QuotationId);
    if (status != 3 && status != 4 && status != 0)
      return res
        .status(400)
        .send({ message: 'Cannot update PO for non-booking quotation' });

    let { PONo, PODate } = req.body;
    if (PONo == '' || PODate == '')
      return res.status(400).send({ message: 'Please enter PO no and date' });

    const UpdatePO = `Update privanet.QuotationPo SET PONo = N'${PONo}', PODate = N'${PODate}' WHERE POId = ${POId}`;
    await pool.request().query(UpdatePO);
    res.status(200).send({ message: 'PO has been edited' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

router.delete('/delete_po/:POId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let POId = req.params.POId;

    const DeletePO = `DELETE FROM privanet.QuotationPo WHERE POId = ${POId}`;
    await pool.request().query(DeletePO);
    res.status(200).send({ message: 'PO has been deleted' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

//TODO: insert invoice
router.post('/add_invoice/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let { POId } = req.body;
    if (POId == '')
      return res.status(400).send({ message: 'Please select PO' });
    const InvoiceNo = await invoiceNoGenerate();
    const InvoiceDate = checkDate();
    const InsertPO = `INSERT INTO privanet.QuotationInvoice(QuotationId, POId, PODate) VALUES(${QuotationId}, ${POId}, N'${InvoiceNo}', N'${InvoiceDate}')`;
    await pool.request().query(InsertPO);
    res.status(201).send({ message: 'PO has been added' });
  } catch (err) {
    res.status(500).send({ message: `${err}` });
  }
});

const detailDefault = {
  time: 1659069460288,
  blocks: [
    {
      id: 'cyZjplMOZ0',
      type: 'paragraph',
      data: {
        text: '<b>ตัวอย่างการพิมพ์(ไม่ต้องทำอะไรถ้าไม่มี Detail แต่ถ้ามีการแก้ไข ให้ลบตัวอย่าง 2 บรรทัดแรกออกแล้วกด Save)</b>',
      },
    },
    {
      id: 'Mj_9XdxLe0',
      type: 'paragraph',
      data: {
        text: '1 รายละเอียด; จำนวน หน่วย; ราคา',
      },
    },
  ],
  version: '2.25.0',
};

module.exports = router;
