# Tech Stack

Core technologies used in the Trading Simulator.

## Backend
- **Node.js 20** with **Express.js** – REST API server
- **Socket.IO** – WebSocket layer for real-time data
- **PostgreSQL** – relational data store
- **pg** – PostgreSQL client for Node.js (no ORM)
- **dotenv** – runtime configuration via environment files

## Frontend
- **Svelte 5** – UI component framework
- **Vite** – development server and build tool
- **Tailwind CSS** – utility-first styling (dark theme)
- **Chart.js** – candlestick chart rendering
- **Socket.IO Client** – real-time feed

## Tooling & DevOps
- **Docker / Docker Compose** – local environment orchestration (`make run`)
- **Makefile** – task shortcuts (`make help`)
- **ESLint / Prettier** – code quality and consistent formatting
- **nodemon** – automatic backend reload during development
