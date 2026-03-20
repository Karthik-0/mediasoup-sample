## 1. Client — Dependencies

- [x] 1.1 Install `mediasoup-client` in `client/`

## 2. Server — Transport Manager

- [x] 2.1 Create `server/transportManager.js` with in-memory Maps for transports and producers
- [x] 2.2 Implement `createWebRtcTransport(routerId)` using `listenInfos` with `announcedAddress: '127.0.0.1'`
- [x] 2.3 Implement `connectTransport(transportId, dtlsParameters)`
- [x] 2.4 Implement `createProducer(transportId, kind, rtpParameters)`
- [x] 2.5 Implement `getTransport(id)` and `getProducer(id)` lookup helpers

## 3. Server — Socket Event Handlers

- [x] 3.1 Add `get-rtp-capabilities` handler: look up router by ID and ack with `{ rtpCapabilities }` or `{ error }`
- [x] 3.2 Add `create-webrtc-transport` handler: call `createWebRtcTransport()` and ack with `{ id, iceParameters, iceCandidates, dtlsParameters }` or `{ error }`
- [x] 3.3 Add `connect-transport` handler: call `connectTransport()` and ack with `{}` or `{ error }`
- [x] 3.4 Add `produce` handler: call `createProducer()` and ack with `{ id }` or `{ error }`

## 4. Client — Meeting Orchestration Module

- [x] 4.1 Create `client/src/lib/meeting.ts` exporting `startMeeting(routerId, socket)` async function
- [x] 4.2 Implement: emit `get-rtp-capabilities`, create `Device`, call `device.load({ routerRtpCapabilities })`
- [x] 4.3 Implement: emit `create-webrtc-transport`, create client send transport via `device.createSendTransport()`
- [x] 4.4 Implement: wire `transport.on('connect')` → emit `connect-transport`
- [x] 4.5 Implement: wire `transport.on('produce')` → emit `produce`, resolve with returned producer ID
- [x] 4.6 Implement: call `getUserMedia({ audio: true, video: true })`
- [x] 4.7 Implement: `transport.produce({ track: videoTrack })` and `transport.produce({ track: audioTrack })`
- [x] 4.8 Return `{ stream, audioProducer, videoProducer }` from `startMeeting()`

## 5. Client — UI

- [x] 5.1 Update `client/src/App.tsx`: after `create-router` succeeds, call `startMeeting(routerId, socket)` from `meeting.ts`
- [x] 5.2 On success: hide Start Meeting button, show `<video autoplay playsinline muted>` with `srcObject = stream`
- [x] 5.3 Add audio toggle button: click toggles `audioProducer.pause()/resume()` and track enabled state; label switches "Mute" ↔ "Unmute"
- [x] 5.4 Add video toggle button: click toggles `videoProducer.pause()/resume()` and track enabled state; label switches "Camera Off" ↔ "Camera On"
- [x] 5.5 On any error in the flow, show error message and re-enable Start Meeting button

## 6. Verification

- [x] 6.1 Start server; confirm four new socket events are logged as registered
- [x] 6.2 Start client dev server; click Start Meeting and confirm video element appears showing camera feed
- [x] 6.3 Confirm server logs show transport created and two producers (audio + video)
- [x] 6.4 Click Mute and confirm audio track is disabled; click Unmute and confirm it resumes
- [x] 6.5 Click Camera Off and confirm video track is disabled; click Camera On and confirm it resumes
