const http = require('http');
const express = require('express');
const { Server: SocketIOServer } = require('socket.io');
const {
  createMediasoupWorkers,
  closeMediasoupWorkers,
  getMediasoupWorkers,
} = require('./mediasoupBootstrap');
const { createRouter, getRouter } = require('./roomManager');
const {
  createWebRtcTransport,
  connectTransport,
  createProducer,
} = require('./transportManager');

const app = express();
const port = Number(process.env.PORT) || 3001;

// Create explicit HTTP server so socket.io can share the same port
const httpServer = http.createServer(app);

// Attach socket.io to the HTTP server
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' },
});

// Socket.io signaling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('create-router', async (ack) => {
    try {
      const router = await createRouter();
      console.log(`Router created: ${router.id} (socket=${socket.id})`);
      if (typeof ack === 'function') ack({ routerId: router.id });
    } catch (error) {
      console.error('Failed to create router:', error);
      if (typeof ack === 'function') ack({ error: error.message });
    }
  });

  socket.on('get-rtp-capabilities', (data, ack) => {
    try {
      const router = getRouter(data?.routerId);
      if (!router) return ack({ error: 'Router not found' });
      ack({ rtpCapabilities: router.rtpCapabilities });
    } catch (error) {
      console.error('get-rtp-capabilities error:', error);
      ack({ error: error.message });
    }
  });

  socket.on('create-webrtc-transport', async (data, ack) => {
    try {
      const transport = await createWebRtcTransport(data?.routerId);
      console.log(`Transport created: ${transport.id} (socket=${socket.id})`);
      ack({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error('create-webrtc-transport error:', error);
      ack({ error: error.message });
    }
  });

  socket.on('connect-transport', async (data, ack) => {
    try {
      await connectTransport(data?.transportId, data?.dtlsParameters);
      ack({});
    } catch (error) {
      console.error('connect-transport error:', error);
      ack({ error: error.message });
    }
  });

  socket.on('produce', async (data, ack) => {
    try {
      const producer = await createProducer(data?.transportId, data?.kind, data?.rtpParameters);
      console.log(`Producer created: ${producer.id} kind=${producer.kind} (socket=${socket.id})`);
      ack({ id: producer.id });
    } catch (error) {
      console.error('produce error:', error);
      ack({ error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

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

    server = httpServer.listen(port, () => {
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
