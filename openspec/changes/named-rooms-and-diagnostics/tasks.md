## 1. Backend Orchestration

- [x] 1.1 Persist `worker.pid` alongside `peerCount` within the `routers` Map in `server/roomManager.js`.
- [x] 1.2 Modify the `get-producers` socket event in `server/index.js` mapping function to return `{ producerId, peerId, routerId, workerPid }` derived from the global active topology maps.
- [x] 1.3 Remove the deprecated `create-router` event from `server/index.js` entirely.

## 2. Frontend React Migration

- [x] 2.1 Refactor the `startMeeting` wrapper inside `client/src/lib/meeting.ts` to stop invoking `create-router`, and align its arguments natively.
- [x] 2.2 Purge the "Start Meeting" discrete logic within `client/src/App.tsx`, consolidating user input purely into a single "Join / Create Meeting" textual input calling `join-room`.
- [x] 2.3 Upgrade the `get-producers` response parsing inside the React `useEffect` interval to accept and persist the `routerId` and `workerPid` into the component `participants` state array.
- [x] 2.4 Render the diagnostic token overlays within the `video-tile` iteration loop showing the physical origin identifiers.
