'use strict';

const { getMediasoupWorkers } = require('./mediasoupBootstrap');

// Default media codecs for all routers
const ROUTER_MEDIA_CODECS = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
  },
];

/** @type {Map<string, { router: import('mediasoup').types.Router, peerCount: number }>} */
const routers = new Map();

/** @type {Map<string, Set<string>>} */
const rooms = new Map();

const MAX_PEERS_PER_ROUTER = 2;
let nextWorkerIndex = 0;

/**
 * Get an existing router with capacity, or spawn a new one on a round-robin worker.
 * @param {string} roomId
 * @returns {Promise<{ router: import('mediasoup').types.Router, isNew: boolean }>}
 */
async function getOrCreateRouter(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  const routerIds = rooms.get(roomId);
  for (const rId of routerIds) {
    const shard = routers.get(rId);
    if (shard && shard.peerCount < MAX_PEERS_PER_ROUTER) {
      return { router: shard.router, isNew: false };
    }
  }

  // All routers full or none exist -> spawn new shard on distributed worker
  const workers = getMediasoupWorkers();
  const worker = workers[nextWorkerIndex % workers.length];
  nextWorkerIndex++;

  const router = await worker.createRouter({ mediaCodecs: ROUTER_MEDIA_CODECS });
  routers.set(router.id, { router, peerCount: 0 });
  routerIds.add(router.id);
  
  return { router, isNew: true };
}

function getRouter(id) {
  return routers.get(id)?.router;
}

function getRoomRouters(roomId) {
  const routerIds = rooms.get(roomId) || new Set();
  return Array.from(routerIds).map(rId => routers.get(rId)?.router).filter(Boolean);
}

function addPeerToRouter(routerId) {
  const shard = routers.get(routerId);
  if (shard) shard.peerCount++;
}

function removePeerFromRouter(routerId) {
  const shard = routers.get(routerId);
  if (shard) shard.peerCount--;
}

module.exports = { 
  getOrCreateRouter, 
  getRouter, 
  getRoomRouters,
  addPeerToRouter,
  removePeerFromRouter
};
