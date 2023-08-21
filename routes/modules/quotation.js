const sql = require('mssql');
const { dbconfig } = require('../../config');

const checkStatus = async (QuotationId) => {
  let pool = await sql.connect(dbconfig);
  let getQuotation = `SELECT QuotationStatus
      FROM privanet.[Quotation]
      WHERE QuotationId = ${QuotationId}`;
  let quotation = await pool.request().query(getQuotation);
  return quotation.recordset[0].QuotationStatus;
};

module.exports = { checkStatus };
