/**
 * Trading Simulator Backend Server
 * Simple Express.js server with Socket.IO for real-time trading
 */

// Import required packages
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

// Import modules using new shared environment system
import { connectDatabase } from "./db/connection.js";
import { APP, validateConfig, logConfig } from "../../shared/config/env.mjs";
import authRoutes from "./routes/auth.js";
import tradingRoutes from "./routes/trading.js";
import portfolioRoutes from "./routes/portfolio.js";
import marketRoutes from "./routes/market.js";
import { setupSocketHandlers } from "./services/socketService.js";
import { requireAuth } from "./middleware/auth.js";

// Validate environment configuration on startup
validateConfig();

// --- express app ---
const app = express();
const server = createServer(app);
const io = new Server(server, {
   cors: {
      origin: APP.FRONTEND.URL,
      credentials: true,
   },
});

// --- middleware ---
app.use(helmet());
app.use(
   cors({
      origin: APP.FRONTEND.URL,
      credentials: true,
   })
);
app.use(express.json()); // parse json bodies
app.use(express.urlencoded({ extended: true })); // parse url-encoded bodies
app.use(compression()); // compress responses

// --- health check ---
app.get("/health", (req, res) => {
   res.json({
      status: "ok",
      message: "server is running",
      timestamp: new Date().toISOString(),
      environment: APP.NODE_ENV,
      version: "2.0.0", // Updated for new environment system
   });
});

// --- Routes ---

// --- public routes (no auth required) ---
// Auth routes should be public (they handle their own auth)
app.use("/api/auth", authRoutes);

// --- protected routes (auth required) ---
app.use("/api/trading", requireAuth, tradingRoutes);
app.use("/api/portfolio", requireAuth, portfolioRoutes);
app.use("/api/market", requireAuth, marketRoutes);

// --- error handling ---
app.use((err, req, res, next) => {
   console.error("Error:", err);
   res.status(500).json({
      error: "Something went wrong!",
      message: err.message,
      ...(APP.IS_DEVELOPMENT && { stack: err.stack }),
   });
});

// --- 404 handler ---
app.use("*", (req, res) => {
   res.status(404).json({ error: "Route not found" });
});

// setup socket.io handlers
setupSocketHandlers(io);

// --- server ---
server.listen(APP.BACKEND.PORT, async () => {
   console.log(`🚀 Trading Simulator Backend v2.0.0`);
   console.log(`🌍 Server running on ${APP.BACKEND.URL}`);
   console.log(`🌍 Environment: ${APP.NODE_ENV}`);
   console.log(`🎯 Frontend URL: ${APP.FRONTEND.URL}`);

   try {
      await connectDatabase();
      console.log("✅ Database connected successfully");
   } catch (error) {
      console.error("❌ Database failed to connect:", error);
   }

   // Log configuration in development
   if (APP.IS_DEVELOPMENT) {
      logConfig();
   }

   console.log("🎮 Trading Simulator ready for connections!");
});
