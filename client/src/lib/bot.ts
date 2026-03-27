import { io } from 'socket.io-client';
import { Device } from 'mediasoup-client';
import type { Socket } from 'socket.io-client';
import { SERVER_URL } from './socket';

export interface BotHandle {
  name: string;
  socketId: string;
  disconnect: () => void;
}

export interface SpawnBotOptions {
  videoSource: 'canvas' | File;
}

/** Promisified socket emit with ack — mirrors the helper in meeting.ts */
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

function createCanvasStream(botName: string, hue: number): { stream: MediaStream; stop: () => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d')!;
  let frame = 0;

  const intervalId = setInterval(() => {
    const bg = `hsl(${(hue + frame * 0.5) % 360}, 60%, 30%)`;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 320, 240);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(botName, 160, 120);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`frame ${frame}`, 310, 230);

    frame++;
  }, 33);

  const stream = (canvas as any).captureStream(30) as MediaStream;
  return { stream, stop: () => clearInterval(intervalId) };
}

async function createFileStream(file: File): Promise<{ stream: MediaStream; stop: () => void }> {
  const video = document.createElement('video');
  video.style.display = 'none';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;
  document.body.appendChild(video);
  await video.play();
  const stream = (video as any).captureStream() as MediaStream;
  return {
    stream,
    stop: () => {
      video.pause();
      URL.revokeObjectURL(objectUrl);
      video.remove();
    },
  };
}

function createSilentAudioTrack(): { track: MediaStreamTrack; stop: () => void } {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  const dest = ctx.createMediaStreamDestination();
  oscillator.connect(gain);
  gain.connect(dest);
  oscillator.start();
  const track = dest.stream.getAudioTracks()[0];
  return { track, stop: () => ctx.close() };
}

export async function spawnBot(
  roomId: string,
  botName: string,
  options: SpawnBotOptions,
  botIndex: number
): Promise<BotHandle> {
  const socket = io(SERVER_URL);

  // Join room
  const joinRes = await emit<{ success?: boolean; routerId?: string; error?: string }>(
    socket, 'join-room', { roomId, userName: botName }
  );
  if (!joinRes.success) throw new Error(joinRes.error ?? 'Bot failed to join room');
  const routerId = joinRes.routerId ?? roomId;

  // Load mediasoup Device
  const { rtpCapabilities } = await emit<{ rtpCapabilities: object }>(
    socket, 'get-rtp-capabilities', { routerId }
  );
  const device = new Device();
  await device.load({ routerRtpCapabilities: rtpCapabilities as any });

  // Create send transport
  const sendTransportParams = await emit<{
    id: string; iceParameters: object; iceCandidates: object[]; dtlsParameters: object;
  }>(socket, 'create-webrtc-transport', { routerId });
  const sendTransport = device.createSendTransport(sendTransportParams as any);

  sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
    emit(socket, 'connect-transport', { transportId: sendTransport.id, dtlsParameters })
      .then(() => callback())
      .catch(errback);
  });

  sendTransport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
    emit<{ id: string }>(socket, 'produce', { roomId, transportId: sendTransport.id, kind, rtpParameters })
      .then(({ id }) => callback({ id }))
      .catch(errback);
  });

  // Acquire video + audio
  const hue = (botIndex * 60) % 360;
  let videoStop: () => void;
  let videoStream: MediaStream;
  if (options.videoSource === 'canvas') {
    const result = createCanvasStream(botName, hue);
    videoStream = result.stream;
    videoStop = result.stop;
  } else {
    const result = await createFileStream(options.videoSource);
    videoStream = result.stream;
    videoStop = result.stop;
  }

  const { track: audioTrack, stop: audioStop } = createSilentAudioTrack();
  const videoTrack = videoStream.getVideoTracks()[0];

  await sendTransport.produce({ track: videoTrack });
  await sendTransport.produce({ track: audioTrack });

  // Consume loop — polls every 2s and subscribes to new remote producers
  const consumedProducers = new Set<string>();
  const consumeIntervalId = setInterval(async () => {
    try {
      const res = await emit<{ producers: { producerId: string }[]; error?: string }>(
        socket, 'get-producers', { roomId }
      );
      if (!res.producers) return;
      for (const { producerId } of res.producers) {
        if (consumedProducers.has(producerId)) continue;
        consumedProducers.add(producerId);
        try {
          const recvParams = await emit<any>(socket, 'create-webrtc-transport', { routerId });
          const recvTransport = device.createRecvTransport(recvParams as any);
          recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
            emit(socket, 'connect-transport', { transportId: recvTransport.id, dtlsParameters })
              .then(() => callback())
              .catch(errback);
          });
          const consumerParams = await emit<any>(socket, 'consume', {
            routerId,
            producerId,
            transportId: recvTransport.id,
            rtpCapabilities: device.rtpCapabilities,
          });
          await recvTransport.consume({
            id: consumerParams.id,
            producerId: consumerParams.producerId,
            kind: consumerParams.kind,
            rtpParameters: consumerParams.rtpParameters,
          });
        } catch (err) {
          console.error(`[bot ${botName}] consume error for producer ${producerId}:`, err);
          consumedProducers.delete(producerId);
        }
      }
    } catch (err) {
      console.error(`[bot ${botName}] get-producers error:`, err);
    }
  }, 2000);

  return {
    name: botName,
    socketId: socket.id ?? '',
    disconnect: () => {
      clearInterval(consumeIntervalId);
      videoStop();
      audioStop();
      socket.disconnect();
    },
  };
}
