# Deployment Guide

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ (LTS recommended) |
| npm | 9+ |
| OS | Linux or macOS (mediasoup requires a POSIX build environment) |

> **Windows:** mediasoup does not support native Windows builds. Use WSL2 or Docker.

---

## Local Development

### 1. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### 2. Start the server

```bash
cd server && npm run dev
```

The server starts on port `3001` by default and logs worker PIDs on startup.

### 3. Start the client

```bash
cd client && npm run dev
```

Vite serves the client at `http://localhost:5173` by default with HMR enabled.

---

## Environment Variables

### Server (`server/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | HTTP/Socket.io listen port |
| `MEDIASOUP_WORKERS` | `4` | Number of mediasoup worker processes to spawn |
| `ANNOUNCED_IP` | `127.0.0.1` | IP address announced in ICE candidates. **Must be set to a publicly reachable IP or hostname for non-local deployments.** |
| `MEDIASOUP_FORCE_FAIL` | _(unset)_ | Set to `1` to force worker startup failure (testing only) |

### Setting in development

Create a `.env` file in `server/` (not committed) and load it manually or via a tool like `dotenv-cli`:

```bash
PORT=3001
MEDIASOUP_WORKERS=2
ANNOUNCED_IP=127.0.0.1
```

---

## Production Build

### Client (static assets)

```bash
cd client && npm run build
```

Output is placed in `client/dist/`. Serve these files from any static host (Nginx, Caddy, S3 + CloudFront, Vercel, etc.).

The client communicates with the server over Socket.io. Point it to the correct server URL by setting `VITE_SERVER_URL` (if configured in `client/src/lib/socket.ts`) or updating the Socket.io connection string before building.

### Server

The server is a plain Node.js process. In production:

```bash
cd server && npm start
```

Use a process manager such as **PM2** or a containerized deployment to handle restarts.

```bash
# PM2 example
npm install -g pm2
PORT=3001 ANNOUNCED_IP=<your-public-ip> MEDIASOUP_WORKERS=4 pm2 start index.js --name mediasoup-server
pm2 save
```

---

## Health Check

The server exposes a liveness endpoint:

```
GET /health
→ 200 { "status": "ok" }
```

Use this for load balancer health checks and container readiness probes.

---

## Docker

There is no Dockerfile included yet. A minimal approach:

```dockerfile
FROM node:20-slim

# mediasoup build dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./

ENV PORT=3001
ENV MEDIASOUP_WORKERS=4
EXPOSE 3001

CMD ["node", "index.js"]
```

Build and run:

```bash
docker build -t mediasoup-server .
docker run -p 3001:3001 -e ANNOUNCED_IP=<your-public-ip> mediasoup-server
```

---

## Network Requirements

mediasoup uses WebRTC transports that require a range of UDP ports to be reachable from clients. By default mediasoup binds to `0.0.0.0` but will announce `ANNOUNCED_IP` in ICE candidates.

For production:
- Set `ANNOUNCED_IP` to the machine's public IP or a resolvable hostname.
- Open UDP ports **40000–49999** (or the range configured in `transportManager.js`) in your firewall/security group.
- Open TCP port `3001` (or `PORT`) for the HTTP/Socket.io signaling connection.

---

## Scaling Considerations

- **Vertical scaling:** Increase `MEDIASOUP_WORKERS` to match available CPU cores. Each worker handles packet forwarding independently.
- **Horizontal scaling:** mediasoup workers are process-local. Running multiple server instances requires a shared signaling layer (e.g., a Redis adapter for Socket.io) and cross-instance pipe transport coordination. This is not implemented in the current codebase.
- **Cross-shard piping:** The `roomManager` already distributes participants across workers within a single server process using `pipeToRouter`. This provides multi-core utilization without any additional infrastructure.
