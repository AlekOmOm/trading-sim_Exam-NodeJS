# Integrations

External services and libraries used by the Trading Simulator.

## Auth-System
- Session-based authentication service.
- Base URL: `http://localhost:3000`.
- Flow: 
   1. Frontend redirects to Auth-System 
   2. ➜ user logs in 
   3. ➜ Auth cookie comes back 
   4. ➜ backend validates on every protected request.
- integration docs:
    - [Auth-System docs](./auth-system/auth-system-integration.md)

## Market Data Feed
- WebSocket endpoint: `wss://candle-data.devalek.dev`.
- Symbol: `BTCUSDT` (1-minute candles).
- The backend consumes the stream and emits Socket.IO `candle` events to connected clients.
    - wss stream: **candle-data.devalek.dev**
    - [Data-Server docs](./data-server/data-server-integration.md)

## PostgreSQL
- Runs inside the local Docker Compose stack (`make run`).
- Core tables: `portfolios`, `positions`, `trades`.

## Frontend CDNs
- Chart.js
- Tailwind CSS

## CI / DevOps
- Docker / Docker Compose for local orchestration.
- Optional GitHub Actions workflow for linting and tests.
