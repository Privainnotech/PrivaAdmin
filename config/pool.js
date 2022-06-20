const sql = require('mssql');
const config = require('./config')

const pool = sql.connect(config);

module.exports = pool