const sql = require('mssql');
const { dbconfig } = require('../config');

const selectDt = async ({
  field = '*',
  table,
  whereQuery,
  otherQuery = '',
}) => {
  const pool = await sql.connect(dbconfig);
  const data = await pool.request().query(`
      SELECT ${field} FROM privanet.${table}
      ${whereQuery ? `WHERE ${whereQuery}` : ''}
      ${otherQuery}`);
  return data.recordset;
};
const insertDt = async ({ field, table, valueQuery }) => {
  const pool = await sql.connect(dbconfig);
  const data = await pool.request().query(`
      INSERT INTO privanet.${table}(${field}) VALUES${valueQuery}
      SELECT SCOPE_IDENTITY() as Id`);
  return data.recordset;
};
const updateDt = async ({ table, valueQuery, whereQuery }) => {
  const pool = await sql.connect(dbconfig);
  const data = await pool.request().query(`
      UPDATE privanet.${table} SET ${valueQuery} WHERE ${whereQuery}`);
  return data.recordset;
};
const deleteDt = async ({ table, whereQuery }) => {
  const pool = await sql.connect(dbconfig);
  const data = await pool.request().query(`
      DELETE FROM privanet.${table} WHERE ${whereQuery}`);
  return data.recordset;
};

const checkExists = async ({ value, field, table }) => {
  const pool = await sql.connect(dbconfig);
  const exists = await pool.request().query(`SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM privanet.${table}
      WHERE ${field} = N'${value}')
    THEN 1 ELSE 0 END as isExists`);
  return exists.recordset[0].isExists;
};

module.exports = {
  selectDt,
  insertDt,
  updateDt,
  deleteDt,
  checkExists,
};
