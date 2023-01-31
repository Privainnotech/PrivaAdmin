const PORT = 3000;
const dbconfig = {
  // user: "privaadmin",
  // password: "Bvc7f&07",
  // server: "119.59.96.61",
  user: "sa",
  password: "P@ssw0rd",
  server: "192.168.1.6",
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
  PORT,
  dbconfig,
};
