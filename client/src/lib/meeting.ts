import { Device } from 'mediasoup-client';
import type { Producer } from 'mediasoup-client/types';
import type { Socket } from 'socket.io-client';

export interface MeetingResult {
  stream: MediaStream;
  audioProducer: Producer;
  videoProducer: Producer;
}

/** Promisified socket emit with ack */
function emit<T>(socket: Socket, event: string, data: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.emit(event, data, (res: T & { error?: string }) => {
      if (res && 'error' in res && res.error) {
        reject(new Error(res.error));
      } else {
        resolve(res);
      }
    });
  });
}

export async function startMeeting(routerId: string, socket: Socket): Promise<MeetingResult> {
  // 4.2 — Load Device with router RTP capabilities
  const { rtpCapabilities } = await emit<{ rtpCapabilities: object }>(
    socket,
    'get-rtp-capabilities',
    { routerId }
  );

  const device = new Device();
  await device.load({ routerRtpCapabilities: rtpCapabilities as Parameters<typeof device.load>[0]['routerRtpCapabilities'] });

  // 4.3 — Create server-side WebRTC transport
  const transportParams = await emit<{
    id: string;
    iceParameters: object;
    iceCandidates: object[];
    dtlsParameters: object;
  }>(socket, 'create-webrtc-transport', { routerId });

  const transport = device.createSendTransport(transportParams as Parameters<typeof device.createSendTransport>[0]);

  // 4.4 — Wire transport 'connect' event
  transport.on('connect', ({ dtlsParameters }, callback, errback) => {
    emit(socket, 'connect-transport', { transportId: transport.id, dtlsParameters })
      .then(() => callback())
      .catch(errback);
  });

  // 4.5 — Wire transport 'produce' event
  transport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
    emit<{ id: string }>(socket, 'produce', { transportId: transport.id, kind, rtpParameters })
      .then(({ id }) => callback({ id }))
      .catch(errback);
  });

  // 4.6 — Acquire local media
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

  // 4.7 — Produce audio and video tracks
  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];

  const videoProducer = await transport.produce({ track: videoTrack });
  const audioProducer = await transport.produce({ track: audioTrack });

  // 4.8 — Return result
  return { stream, audioProducer, videoProducer };
}
