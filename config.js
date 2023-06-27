const PORT = 2999;
const dbconfig = {
  // main
  user: "privaadmin",
  password: "Jz2^7b8a",
  server: "119.59.96.61",
  // test
  // user: "sa",
  // password: "P@ssw0rd",
  // server: "192.168.1.6",
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
