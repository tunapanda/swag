let environment;
if (!process.env.NODE_ENV) {
  environment = process.argv.indexOf('--cypress') > -1 ? 'test' : 'development';
  process.env.NODE_ENV = environment;
}
console.log(`ENVIRONMENT: ${environment}`);

const http = require('http');
const socketIO = require('socket.io');
/*
 * Express Setup
 */

const app = require('./server');

/*
 * Get port from environment (default 3000)
 */
const port = process.env.SERVER_PORT ? process.env.SERVER_PORT :
  process.argv.indexOf('--port') > -1 ? process.argv[process.argv.indexOf('--port') + 1] : 3000;

// app.set('port', port);
// app.set('host', '0.0.0.0');

/*
 * Create Server
 */

const server = http.createServer(app.callback());

const io = socketIO(server);

/**
 * Call event handlers into the app process
 */

require('./event-handlers/socket-events')(io);
require('./event-handlers/mne-surveys')();



/*
 * Listen on provided port, on all network interfaces.
 */

if (require.main === module) {
  server.listen(port);

  server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
  });
}

module.exports = server;
