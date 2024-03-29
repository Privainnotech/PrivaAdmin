const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { dbconfig } = require('../../config');

const path = require('path');
const fs = require('fs');
const pdfMake = require('pdfmake');

const { fonts, customLayouts } = require('../modules/pdfAssets');
const { createQuotationPdf } = require('../modules/quotationPDF');

router.get('/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotation = `SELECT b.QuotationNo, a.QuotationRevised,
      c.CustomerName, c.CustomerEmail, f.CompanyName, f.CompanyAddress, a.EndCustomer,
      a.QuotationSubject, FORMAT(a.QuotationDate, 'dd-MM-yyyy') QuotationDate,
      a.QuotationTotalPrice, a.QuotationDiscount,
      a.QuotationNet, a.QuotationVat, a.QuotationNetVat,
      CONVERT(nvarchar(max), a.QuotationValidityDate) AS 'QuotationValidityDate',
      CONVERT(nvarchar(max), a.QuotationPayTerm) AS 'QuotationPayTerm',
      CONVERT(nvarchar(max), a.QuotationDelivery) AS 'QuotationDelivery',
      CONVERT(nvarchar(max), a.QuotationRemark) AS 'QuotationRemark',
      CONVERT(nvarchar(max), a.QuotationDetail) AS 'QuotationDetail',
      a.QuotationApproval, a.EmployeeApproveId,
      e.EmployeeFname + ' ' + e.EmployeeLname EmployeeName,
      e.EmployeeFname, e.EmployeeLname, e.EmployeeEmail, e.EmployeePosition
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN privanet.[MasterCustomer] c ON a.CustomerId = c.CustomerId
      LEFT JOIN privanet.[MasterStatus] d ON a.QuotationStatus = d.StatusId
      LEFT JOIN privanet.[MasterEmployee] e ON a.EmployeeApproveId = e.EmployeeId
      LEFT JOIN privanet.[MasterCompany] f ON c.CompanyId = f.CompanyId
      WHERE a.QuotationId = ${QuotationId}`;
    let getSetting = `SELECT TableShow, TablePrice, TableQty, TableTotal
      FROM privanet.QuotationSetting
      WHERE QuotationId = ${QuotationId}`;
    let getPayterm = `SELECT IndexPayTerm,PayTerm,PayPercent FROM privanet.QuotationPayTerm
      WHERE QuotationId = ${QuotationId} ORDER BY IndexPayTerm;`;
    let quotations = await pool.request().query(getQuotation);
    let settings = await pool.request().query(getSetting);
    let payterms = await pool.request().query(getPayterm);
    let quotation = quotations.recordset[0];
    let setting = settings.recordset[0];
    let payterm = payterms.recordset;
    if (quotation.EmployeeApproveId == null)
      return res.status(400).send({ message: 'Please select Approver' });
    // console.log(setting)
    let quotationNo = '';
    if (quotation.QuotationRevised < 10)
      quotationNo = quotation.QuotationNo + '_0' + quotation.QuotationRevised;
    else quotationNo = quotation.QuotationNo + '_' + quotation.QuotationRevised;
    let quotationPdf = await createQuotationPdf(
      QuotationId,
      quotationNo,
      quotation,
      setting,
      payterm
    );
    let pdfCreator = new pdfMake(fonts);
    console.log('Creating quotation....');
    let pdfDoc = pdfCreator.createPdfKitDocument(quotationPdf, {
      tableLayouts: customLayouts,
    });
    console.log('Quotation created');
    let quotationPath = path.join(
      process.cwd(),
      `/public/report/quotation/${quotationNo}.pdf`
    );
    console.log('file creating');
    let creating = pdfDoc.pipe(fs.createWriteStream(quotationPath));
    pdfDoc.end();
    creating.on('finish', () => {
      console.log('create file success');
      res.send({ message: `/report/quotation/${quotationNo}.pdf` });
      // res.status(200).sendFile(quotationPath)
      // res.download(quotationPath)
      // res.status(200).send({message: 'Successfully create quotation report'});
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});

router.get('/download/:QuotationId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let QuotationId = req.params.QuotationId;
    let getQuotation = `SELECT b.QuotationNo, a.QuotationRevised
        FROM privanet.[Quotation] a
        LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
        WHERE a.QuotationId = ${QuotationId}`;
    let quotations = await pool.request().query(getQuotation);
    let quotation = quotations.recordset[0];
    let quotationNo = '';
    if (quotation.QuotationRevised < 10)
      quotationNo = quotation.QuotationNo + '_0' + quotation.QuotationRevised;
    else quotationNo = quotation.QuotationNo + '_' + quotation.QuotationRevised;
    let quotationPath = path.join(
      process.cwd(),
      `/public/report/quotation/${quotationNo}.pdf`
    );
    fs.readFileSync(quotationPath);
    res.status(200).download(quotationPath);
  } catch (err) {
    if (err.code.includes('ENOENT')) {
      res
        .status(500)
        .send({ message: 'Please preview quotation before download' });
      return;
    }
    res.status(500).send({ message: `${err}` });
  }
});

// TODO: Invoice PDF API
router.get('/invoice/:InvoiceId', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let InvoiceId = req.params.InvoiceId;
    let invoices = await pool
      .request()
      .query(
        `SELECT QuotationId,POId,InvoiceNo,InvoiceDate FROM privanet.QuotationInvoice WHERE InvoiceId = ${InvoiceId}`
      );
    const { QuotationId, POId, InvoiceNo, InvoiceDate } = invoices.recordset[0];
    let getQuotation = `SELECT 
      c.CustomerName, c.CustomerEmail, f.CompanyName, f.CompanyAddress, f.CompanyTaxNo,
      a.QuotationSubject, a.QuotationTotalPrice, a.QuotationDiscount,
      a.QuotationNet, a.QuotationVat, a.QuotationNetVat,
      a.QuotationApproval
      FROM privanet.[Quotation] a
      LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
      LEFT JOIN privanet.[MasterCustomer] c ON a.CustomerId = c.CustomerId
      LEFT JOIN privanet.[MasterCompany] f ON c.CompanyId = f.CompanyId
      WHERE a.QuotationId = ${QuotationId}`;
    let getSetting = `SELECT TableShow, TablePrice, TableQty, TableTotal
      FROM privanet.QuotationSetting
      WHERE QuotationId = ${QuotationId}`;
    let getPO = `SELECT PONo,PODate FROM privanet.QuotationPO WHERE POId = ${POId}`;
    let quotations = await pool.request().query(getQuotation);
    let settings = await pool.request().query(getSetting);
    let pos = await pool.request().query(getPO);
    let quotation = quotations.recordset[0];
    let setting = settings.recordset[0];
    let invoice = { InvoiceNo, InvoiceDate };
    let po = pos.recordset[0];
    // console.log(setting)
    let quotationPdf = await createQuotationPdf(
      QuotationId,
      quotationNo,
      quotation,
      setting
    );
    let pdfCreator = new pdfMake(fonts);
    console.log('Creating quotation....');
    let pdfDoc = pdfCreator.createPdfKitDocument(quotationPdf, {
      tableLayouts: customLayouts,
    });
    console.log('Quotation created');
    let quotationPath = path.join(
      process.cwd(),
      `/public/report/quotation/${quotationNo}.pdf`
    );
    console.log('file creating');
    let creating = pdfDoc.pipe(fs.createWriteStream(quotationPath));
    pdfDoc.end();
    creating.on('finish', () => {
      console.log('create file success');
      res.send({ message: `/report/quotation/${quotationNo}.pdf` });
      // res.status(200).sendFile(quotationPath)
      // res.download(quotationPath)
      // res.status(200).send({message: 'Successfully create quotation report'});
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: `${err}` });
  }
});

router.get('/invoice/:InvoiceId/download', async (req, res) => {
  try {
    let pool = await sql.connect(dbconfig);
    let InvoiceId = req.params.InvoiceId;
    let getQuotation = `SELECT b.QuotationNo, a.QuotationRevised
        FROM privanet.[Quotation] a
        LEFT JOIN privanet.[QuotationNo] b ON a.QuotationNoId = b.QuotationNoId
        WHERE a.QuotationId = ${QuotationId}`;
    let quotations = await pool.request().query(getQuotation);
    let quotation = quotations.recordset[0];
    let quotationNo = '';
    if (quotation.QuotationRevised < 10)
      quotationNo = quotation.QuotationNo + '_0' + quotation.QuotationRevised;
    else quotationNo = quotation.QuotationNo + '_' + quotation.QuotationRevised;
    let quotationPath = path.join(
      process.cwd(),
      `/public/report/quotation/${quotationNo}.pdf`
    );
    fs.readFileSync(quotationPath);
    res.status(200).download(quotationPath);
  } catch (err) {
    if (err.code.includes('ENOENT')) {
      res
        .status(500)
        .send({ message: 'Please preview quotation before download' });
      return;
    }
    res.status(500).send({ message: `${err}` });
  }
});

module.exports = router;
