// Set options as a parameter, environment variable, or rc file.
// eslint-disable-next-line no-global-assign
// require = require("esm")(module/* , options */)
// module.exports = require("./main.js")

import config from './src/config/index.js';
import express from 'express';
import Logger from './src/loaders/logger.js';
import loaders from './src/loaders/index.js';
import http from 'http';
import expressip from 'express-ip';
// import socket from './config/socket.js';

async function startServer() {
  const app = express();
  app.use(expressip().getIpInfoMiddleware);

  // start by first loading all the required dependencies before listening for requests
  // see the main loader class index

  await loaders({ expressApp: app });

  // socket(io)

  app.listen(process.env.PORT || config.port, () => {
    Logger.info(`Started listening on port: ${process.env.PORT || config.port}`);
  }).on('error', err => {
    Logger.error(err);
    process.exit(1);
  });
}

startServer();
