const express = require('express');
const {
  createMediasoupWorkers,
  closeMediasoupWorkers,
  getMediasoupWorkers,
} = require('./mediasoupBootstrap');

const app = express();
const port = Number(process.env.PORT) || 3001;
let server;

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down`);

  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('HTTP server closed');
        resolve();
      });
    });
  }

  await closeMediasoupWorkers();
  process.exit(0);
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function start() {
  try {
    const workers = await createMediasoupWorkers();
    const workerPids = getMediasoupWorkers().map((worker) => worker.pid);
    console.log(
      `Mediasoup workers started (count=${workers.length}, pids=${workerPids.join(',')})`
    );

    server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
  } catch (error) {
    console.error('Failed to initialize mediasoup workers', error);
    process.exit(1);
  }
}

void start();
