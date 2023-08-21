const sql = require('mssql');
const { dbconfig } = require('../config');
const { checkMonth } = require('./datetime');

const moneyFormat = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const preQuotationNoGenerate = async () => {
  let pool = await sql.connect(dbconfig);
  let month = checkMonth();
  console.log(month);
  let SearchQuotationNo = await pool
    .request()
    .query(
      `SELECT * FROM privanet.QuotationNo WHERE QuotationNo LIKE N'pre_${month}%'`
    );
  // Check QuotationNo
  let Number = SearchQuotationNo.recordset.length;
  const genQuotationNo = await checkNo(month, Number, 'QuotationNo', 'pre_');
  return genQuotationNo;
};

const quotationNoGenerate = async () => {
  let pool = await sql.connect(dbconfig);
  let month = checkMonth();
  let SearchQuotationNo = await pool.request().query(`SELECT *
    FROM privanet.QuotationNo WHERE QuotationNo LIKE N'${month}%'`);
  // Check QuotationNo
  let Number = SearchQuotationNo.recordset.length;
  const genQuotationNo = await checkNo(month, Number, 'QuotationNo');
  return genQuotationNo;
};

const invoiceNoGenerate = async () => {
  let pool = await sql.connect(dbconfig);
  let month = checkMonth();
  let SearchInvoiceNo = await pool.request().query(`SELECT *
    FROM privanet.QuotationInvoice WHERE InvoiceNo LIKE N'${month}%'`);
  // Check InvoiceNo
  let Number = SearchInvoiceNo.recordset.length;
  const genInvoiceNo = await checkNo(month, Number, 'QuotationInvoice');
  return genInvoiceNo;
};

const checkNo = async (month, Number, Table, Prefix = '') => {
  let genNo = '';
  let duplicateNo = true;
  let pool = await sql.connect(dbconfig);
  let fromQuery =
    Table == 'QuotationNo'
      ? `FROM privanet.QuotationNo`
      : `FROM privanet.QuotationInvoice`;
  do {
    if (Number < 10) genNo = Prefix + month + '00' + Number;
    else if (Number < 100) genNo = Prefix + month + '0' + Number;
    else genNo = Prefix + month + Number;
    let whereQuery =
      Table == 'QuotationNo'
        ? `WHERE QuotationNo = N'${genNo}'`
        : `WHERE InvoiceNo = N'${genNo}'`;
    let CheckInvoiceNo = await pool.request().query(`SELECT CASE
      WHEN EXISTS(SELECT * ${fromQuery} ${whereQuery})
      THEN CAST (1 AS BIT)
      ELSE CAST (0 AS BIT) END AS 'check'`);
    duplicateNo = CheckInvoiceNo.recordset[0].check;
    if (duplicateNo) Number++;
  } while (duplicateNo);
  return genNo;
};

module.exports = {
  moneyFormat,
  preQuotationNoGenerate,
  quotationNoGenerate,
  invoiceNoGenerate,
};
