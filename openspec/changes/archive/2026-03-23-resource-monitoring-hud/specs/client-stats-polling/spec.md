## ADDED Requirements

### Requirement: App polls get-stats every 3 seconds
The client SHALL emit a `get-stats` socket event every 3 seconds and store the response in `hardwareStats` React state. Polling SHALL begin as soon as the socket is connected, whether in the lobby or in a meeting.

#### Scenario: Polling starts on mount
- **WHEN** the `App` component mounts and the socket is connected
- **THEN** a `setInterval` fires every 3000ms emitting `get-stats`

#### Scenario: Polling stops on unmount
- **WHEN** the `App` component unmounts
- **THEN** the `setInterval` is cleared and no further `get-stats` events are emitted

#### Scenario: hardwareStats state is updated on each response
- **WHEN** the server responds to `get-stats`
- **THEN** `hardwareStats.systemStats` and `hardwareStats.workerStats` are updated with the latest values

### Requirement: startMeeting returns sendTransport
The `startMeeting()` function in `meeting.ts` SHALL return `{ device, sendTransport }` so that `App.tsx` can call `sendTransport.getStats()` for bandwidth measurement.

#### Scenario: sendTransport exposed from startMeeting
- **WHEN** `startMeeting()` completes successfully
- **THEN** the resolved value SHALL include a `sendTransport` property referencing the mediasoup-client `Transport` instance

### Requirement: App polls RTCPeerConnection stats for bandwidth every 3 seconds
When in a meeting (sendTransport is non-null), the client SHALL call `sendTransport.getStats()` every 3 seconds and compute uplink/downlink kbps by differencing `bytesSent` / `bytesReceived` across consecutive samples.

Uplink kbps SHALL be derived from `outbound-rtp` entries' `bytesSent` delta.
Downlink kbps SHALL be derived from `inbound-rtp` entries' `bytesReceived` (or from `recvTransport.getStats()` if recv transports are tracked).

#### Scenario: Bandwidth computed from delta
- **WHEN** two consecutive polls return `bytesSent` values B1 and B2 over an interval of T ms
- **THEN** upload kbps = `(B2 - B1) * 8 / T * 1000 / 1024`

#### Scenario: Bandwidth shows dash when not in meeting
- **WHEN** the user has not joined a room (sendTransport is null)
- **THEN** `hardwareStats.sendBitrate` and `hardwareStats.recvBitrate` SHALL be `null`

#### Scenario: Bandwidth polling clears on leave
- **WHEN** the user leaves the meeting
- **THEN** the bandwidth polling interval is cleared and bitrates are reset to `null`

### Requirement: consumeRemote exposes recvTransport
The `consumeRemote()` function in `meeting.ts` SHALL return `{ stream, recvTransport }` so that `App.tsx` can accumulate recv transports for downlink bandwidth measurement.

#### Scenario: recvTransport exposed from consumeRemote
- **WHEN** `consumeRemote()` completes successfully
- **THEN** the resolved value SHALL include a `recvTransport` property referencing the mediasoup-client recv `Transport` instance
