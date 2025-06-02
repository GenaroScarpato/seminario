// index.js
require('dotenv').config();
const Server = require('./server'); // o './Server' según nombre exacto

const server = new Server();
server.listen();
