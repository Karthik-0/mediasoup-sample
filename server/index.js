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
  getTransport,
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
    // In-memory room membership: roomId -> Set of socket ids
    const rooms = io.roomsMap = io.roomsMap || new Map();

    // In-memory: producerId -> { producer, socketId, roomId }
    const producers = io.producersMap = io.producersMap || new Map();


    // join-room event: { roomId }, ack({ success, error })
    socket.on('join-room', (data, ack) => {
      try {
        const roomId = data?.roomId;
        if (!roomId) return ack && ack({ error: 'Missing roomId' });
        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId).add(socket.id);
        socket.join(roomId);
        // Notify existing peers in the room
        socket.to(roomId).emit('peer-joined', { peerId: socket.id });
        if (typeof ack === 'function') ack({ success: true });
      } catch (error) {
        console.error('join-room error:', error);
        if (typeof ack === 'function') ack({ error: error.message });
      }
    });

    socket.on('disconnect', () => {
      // Remove from all rooms and notify peers
      for (const [roomId, members] of rooms.entries()) {
        if (members.delete(socket.id)) {
          socket.to(roomId).emit('peer-left', { peerId: socket.id });
          if (members.size === 0) rooms.delete(roomId);
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
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
      producers.set(producer.id, { producer, socketId: socket.id, roomId: data?.roomId });
      console.log(`Producer created: ${producer.id} kind=${producer.kind} (socket=${socket.id})`);
      ack({ id: producer.id });
    } catch (error) {
      console.error('produce error:', error);
      ack({ error: error.message });
    }
  });

  socket.on('get-producers', (data, ack) => {
    try {
      const roomId = data?.roomId;
      if (!roomId) return ack({ error: 'Missing roomId' });
      const producersList = [];
      for (const [id, info] of producers.entries()) {
        if (info.roomId === roomId && info.socketId !== socket.id) {
          producersList.push({ producerId: id, peerId: info.socketId });
        }
      }
      console.log(`get-producers called by ${socket.id} for room ${roomId}: found ${producersList.length} producers`);
      ack({ producers: producersList });
    } catch (error) {
      ack({ error: error.message });
    }
  });

  socket.on('consume', async (data, ack) => {
    try {
      const { routerId, producerId, transportId, rtpCapabilities } = data || {};
      if (!routerId || !producerId || !transportId) return ack({ error: 'Missing routerId, producerId, or transportId' });

      // Get router and producer
      const router = getRouter(routerId);
      if (!router) return ack({ error: 'Router not found' });
      const producerInfo = io.producersMap.get(producerId);
      if (!producerInfo) return ack({ error: 'Producer not found' });
      const producer = producerInfo.producer;

      // Locate the existing WebRTC transport the client just created
      const recvTransport = getTransport(transportId);
      if (!recvTransport) return ack({ error: 'Consumer WebRTC transport not found' });

      // Create the consumer
      const consumer = await recvTransport.consume({
        producerId: producer.id,
        rtpCapabilities: rtpCapabilities || router.rtpCapabilities,
        paused: false,
      });

      // mediasoup consumer params to send to client
      ack({
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (error) {
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
