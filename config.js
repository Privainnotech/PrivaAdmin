require("dotenv").config();

const { SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_SERVER, SQL_PORT } =
  process.env;

const dbconfig = {
  user: "privaadmin",
  password: "Bvc7f&07",
  server: "119.59.96.61",
  database: "PrivaDashboard",
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    trustedConnection: true,
  },
};

module.exports = {
  dbconfig,
};
