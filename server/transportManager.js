'use strict';

const { getRouter } = require('./roomManager');

/** @type {Map<string, import('mediasoup').types.WebRtcTransport>} */
const transports = new Map();

/** @type {Map<string, import('mediasoup').types.Producer>} */
const producers = new Map();

/**
 * Create a WebRTC send transport for the given router.
 * @param {string} routerId
 * @returns {Promise<import('mediasoup').types.WebRtcTransport>}
 */
async function createWebRtcTransport(routerId) {
  const router = getRouter(routerId);
  if (!router) throw new Error(`Router not found: ${routerId}`);

  const transport = await router.createWebRtcTransport({
    listenInfos: [
      {
        protocol: 'udp',
        ip: '0.0.0.0',
        announcedAddress: process.env.ANNOUNCED_IP || '127.0.0.1',
      },
      {
        protocol: 'tcp',
        ip: '0.0.0.0',
        announcedAddress: process.env.ANNOUNCED_IP || '127.0.0.1',
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });

  transports.set(transport.id, transport);

  transport.on('dtlsstatechange', (state) => {
    if (state === 'closed') transports.delete(transport.id);
  });

  return transport;
}

/**
 * Connect a WebRTC transport (complete DTLS handshake).
 * @param {string} transportId
 * @param {object} dtlsParameters
 */
async function connectTransport(transportId, dtlsParameters) {
  const transport = transports.get(transportId);
  if (!transport) throw new Error(`Transport not found: ${transportId}`);
  await transport.connect({ dtlsParameters });
}

/**
 * Create a Producer on an existing transport.
 * @param {string} transportId
 * @param {'audio'|'video'} kind
 * @param {object} rtpParameters
 * @returns {Promise<import('mediasoup').types.Producer>}
 */
async function createProducer(transportId, kind, rtpParameters) {
  const transport = transports.get(transportId);
  if (!transport) throw new Error(`Transport not found: ${transportId}`);

  const producer = await transport.produce({ kind, rtpParameters });
  producers.set(producer.id, producer);

  producer.on('transportclose', () => producers.delete(producer.id));

  return producer;
}

/**
 * Get a transport by ID.
 * @param {string} id
 * @returns {import('mediasoup').types.WebRtcTransport | undefined}
 */
function getTransport(id) {
  return transports.get(id);
}

/**
 * Get a producer by ID.
 * @param {string} id
 * @returns {import('mediasoup').types.Producer | undefined}
 */
function getProducer(id) {
  return producers.get(id);
}

module.exports = { createWebRtcTransport, connectTransport, createProducer, getTransport, getProducer };
