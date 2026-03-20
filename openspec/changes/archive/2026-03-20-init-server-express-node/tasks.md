## 1. Server Project Setup

- [x] 1.1 Initialize a Node.js project in `server/` and create `package.json`
- [x] 1.2 Add npm scripts for server start and development run modes
- [x] 1.3 Add Express as a runtime dependency in `server/package.json`
- [x] 1.4 Add/update ignore rules for Node artifacts in `server/`

## 2. Express Server Bootstrap

- [x] 2.1 Create the server entrypoint file using CommonJS
- [x] 2.2 Configure Express app initialization and HTTP listener startup
- [x] 2.3 Implement `GET /health` to return HTTP 200 with a health payload
- [x] 2.4 Implement port selection from `PORT` with a documented default

## 3. Verification

- [x] 3.1 Install server dependencies and confirm install completes successfully
- [x] 3.2 Run the server and verify startup on default port when `PORT` is unset
- [x] 3.3 Run the server with explicit `PORT` value and verify it binds correctly
- [x] 3.4 Call `GET /health` and verify expected success response
