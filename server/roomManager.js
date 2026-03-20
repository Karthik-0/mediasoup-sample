'use strict';

const { getMediasoupWorker } = require('./mediasoupBootstrap');

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

/** @type {Map<string, import('mediasoup').types.Router>} */
const routers = new Map();

/**
 * Create a new mediasoup Router on an available worker.
 * @returns {Promise<import('mediasoup').types.Router>}
 */
async function createRouter() {
  const worker = getMediasoupWorker();
  const router = await worker.createRouter({ mediaCodecs: ROUTER_MEDIA_CODECS });
  routers.set(router.id, router);
  return router;
}

/**
 * Get a Router by ID.
 * @param {string} id
 * @returns {import('mediasoup').types.Router | undefined}
 */
function getRouter(id) {
  return routers.get(id);
}

module.exports = { createRouter, getRouter };
