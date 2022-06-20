const sql = require('mssql');
require('dotenv').config();

const {PORT, SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_SERVER} = process.env

const dbconfig = {
    user: SQL_USER,
    password: SQL_PASSWORD,
    server: SQL_SERVER,
    database: SQL_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection: true
    }
}

const pool = sql.connect(dbconfig);

module.exports = {
    PORT,
    pool
}