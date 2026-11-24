'use strict';

const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3000;
const server = createApp();

server.listen(port, '0.0.0.0', () => {
  console.log(`cicd-demo listening on port ${port}`);
});

// Docker sends SIGTERM on stop; close cleanly so deploys don't drop requests.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
