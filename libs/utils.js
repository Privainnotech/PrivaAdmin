const sql = require('mssql');
const { dbconfig } = require('../config');
const { checkMonth } = require('./datetime');

const moneyFormat = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const quotationNoGenerate = async () => {
  let pool = await sql.connect(dbconfig);
  let month = checkMonth();
  let genQuotationNo = '';
  let SearchQuotationNo = await pool
    .request()
    .query(
      `SELECT * FROM privanet.QuotationNo WHERE QuotationNo LIKE N'pre_${month}%'`
    );
  // Check QuotationNo
  let duplicateNo = true;
  let Number = SearchQuotationNo.recordset.length;
  do {
    if (Number < 10) genQuotationNo = 'pre_' + month + '00' + Number;
    else if (Number < 100) genQuotationNo = 'pre_' + month + '0' + Number;
    else genQuotationNo = 'pre_' + month + Number;

    let CheckQuotationNo = await pool.request().query(`SELECT CASE
        WHEN EXISTS(SELECT * FROM privanet.QuotationNo WHERE QuotationNo = N'${genQuotationNo}')
        THEN CAST (1 AS BIT) ELSE CAST (0 AS BIT) END AS 'check'`);
    duplicateNo = CheckQuotationNo.recordset[0].check;
    if (duplicateNo) Number++;
  } while (duplicateNo);
  return genQuotationNo;
};

module.exports = { moneyFormat, quotationNoGenerate };
