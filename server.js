const app = require('./app');
const http = require('http');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

http.createServer(app).listen(PORT, () => console.log(`Server is listening on ${PORT}`))