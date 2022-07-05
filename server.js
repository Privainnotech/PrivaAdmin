const app = require('./app');
const debug = require('debug')('express-demo:server');
const http = require('http');
require('dotenv').config();
const PORT = normalizePort(process.env.PORT || 3000);

let server = http.createServer(app);

server.listen(PORT)
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var PORT = parseInt(val, 10);
  
    if (isNaN(PORT)) {
      // named pipe
      return val;
    }
  
    if (PORT >= 0) {
      // PORT number
      return PORT;
    }
  
    return false;
  }

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = typeof PORT === 'string'
      ? 'Pipe ' + PORT
      : 'Port ' + PORT;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.PORT;
    debug('Listening on ' + bind);
  }