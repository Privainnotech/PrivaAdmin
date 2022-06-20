const config = {
    user: 'admin',
    password: 'admin',
    server: '192.168.1.43',
    database: 'PrivaAdminDB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection: true
    }
}

module.exports = config