/**
 * Socket.IO Service
 * Handles real-time connections for market data and trading updates
 * Updated to match data-server API specification
 */

import { io as socketIoClient } from "socket.io-client";
import { EXTERNAL_SERVICES, DEBUG } from "../../../shared/config/env.mjs";

let io; // Will hold our Socket.IO server instance
let marketDataSocket; // Connection to external market data
let connectedSymbols = new Set(); // Track which symbols we're subscribed to

// Global storage for current market prices
global.currentMarketPrice = global.currentMarketPrice || {};

/**
 * Setup Socket.IO event handlers
 * @param {Object} socketServer - The Socket.IO server instance
 */
export function setupSocketHandlers(socketServer) {
   io = socketServer;

   // Connect to external market data source
   connectToMarketData();

   // Handle client connections
   io.on("connection", (socket) => {
      if (DEBUG.WEBSOCKET) {
         console.log("🔱 Client connected:", socket.id);
      }

      // Handle client subscribing to market data
      socket.on("subscribe", (data) => {
         const { symbols } = data;
         if (DEBUG.WEBSOCKET) {
            console.log("📊 Client subscribing to symbols:", symbols);
         }

         // Join rooms for each symbol
         symbols.forEach((symbol) => {
            socket.join(`market:${symbol}`);
            if (DEBUG.WEBSOCKET) {
               console.log(
                  `✅ Client ${socket.id} joined room: market:${symbol}`
               );
            }

            // Add to our tracked symbols for historical data requests
            connectedSymbols.add(symbol);

            // Request historical data for this symbol if we have market data connection
            if (marketDataSocket && marketDataSocket.connected) {
               requestHistoricalData(symbol);
            }
         });
      });

      // Handle client unsubscribing
      socket.on("unsubscribe", (data) => {
         const { symbols } = data;
         if (DEBUG.WEBSOCKET) {
            console.log("📉 Client unsubscribing from symbols:", symbols);
         }

         symbols.forEach((symbol) => {
            socket.leave(`market:${symbol}`);
            if (DEBUG.WEBSOCKET) {
               console.log(
                  `❌ Client ${socket.id} left room: market:${symbol}`
               );
            }
         });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
         if (DEBUG.WEBSOCKET) {
            console.log("🔱 Client disconnected:", socket.id);
         }
      });
   });
}

/**
 * Connect to external market data WebSocket
 * Following the data-server integration guide specification
 */
function connectToMarketData() {
   if (DEBUG.WEBSOCKET) {
      console.log("🔌 Connecting to market data server...");
   }

   marketDataSocket = socketIoClient(EXTERNAL_SERVICES.DATA_SERVER.URL, {
      transports: ["websocket"], // As recommended in the integration guide
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 10,
   });

   marketDataSocket.on("connect", () => {
      console.log("✅ Connected to market data server");

      // Always request BTCUSDT historical data when connected (only available symbol)
      requestHistoricalData("BTCUSDT");

      // Request historical data for any symbols we're already tracking
      connectedSymbols.forEach((symbol) => {
         requestHistoricalData(symbol);
      });
   });

   marketDataSocket.on("disconnect", () => {
      console.log("❌ Disconnected from market data server");
   });

   // Handle time range info (server tells us available data range)
   marketDataSocket.on("time_range_info", (data) => {
      if (DEBUG.WEBSOCKET) {
         console.log("📅 Time range info:", data);
      }
   });

   // Handle historical data response (bulk candles)
   marketDataSocket.on("historical_data_response", (data) => {
      if (DEBUG.WEBSOCKET) {
         console.log(
            "📊 Received historical data:",
            data.data?.length,
            "candles"
         );
      }

      if (data.data && Array.isArray(data.data)) {
         // Process each historical candle
         data.data.forEach((candle) => {
            broadcastCandleToClients(candle);
         });
      }
   });

   // Handle real-time candle updates (single candles)
   marketDataSocket.on("candle_update", (candle) => {
      if (DEBUG.WEBSOCKET) {
         console.log("📊 Real-time candle update for:", candle.symbol);
      }
      broadcastCandleToClients(candle);
   });

   // Handle application errors from data server
   marketDataSocket.on("error_response", (error) => {
      console.error("❌ Data server error:", error.message);
      if (error.details) {
         console.error("Error details:", error.details);
      }
   });

   // Handle Socket.IO connection errors
   marketDataSocket.on("connect_error", (error) => {
      console.error("❌ Market data connection error:", error.message);
   });

   // Handle reconnection attempts
   marketDataSocket.on("reconnect_attempt", (attemptNumber) => {
      if (DEBUG.WEBSOCKET) {
         console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      }
   });

   marketDataSocket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
   });
}

/**
 * Request historical data for a symbol
 * Following the data-server API specification
 * @param {string} symbol - Symbol to request data for
 * @param {number} limit - Number of candles to request (default: 100)
 */
function requestHistoricalData(symbol = "BTCUSDT", limit = 100) {
   if (!marketDataSocket || !marketDataSocket.connected) {
      if (DEBUG.WEBSOCKET) {
         console.log(
            "⏳ Market data socket not connected, will request when connected"
         );
      }
      return;
   }

   const now = Date.now();
   const intervalMs = 60000; // 1 minute intervals
   const startTime = now - limit * intervalMs;

   const request = {
      start_time_ms: startTime,
      end_time_ms: now,
      symbol: symbol,
      interval: "1m",
      limit: limit,
   };

   if (DEBUG.WEBSOCKET) {
      console.log(
         `📊 Requesting historical data for ${symbol} (${limit} candles)`
      );
   }
   marketDataSocket.emit("request_historical_data", request);
}

/**
 * Broadcast candle data to subscribed clients
 * @param {Object} candle - Candle data from data server
 */
function broadcastCandleToClients(candle) {
   if (io && candle.symbol) {
      // Convert candle data to our expected format for consistency
      const formattedCandle = {
         timestamp: candle.timestamp,
         symbol: candle.symbol,
         interval: candle.interval,
         open: parseFloat(candle.open),
         high: parseFloat(candle.high),
         low: parseFloat(candle.low),
         close: parseFloat(candle.close),
         volume: parseFloat(candle.volume),
         is_closed: candle.is_closed,
      };

      // Store current market price globally for portfolio calculations
      global.currentMarketPrice[candle.symbol] = formattedCandle.close;

      // Broadcast to all clients subscribed to this symbol
      io.to(`market:${candle.symbol}`).emit("candle", formattedCandle);
   }
}

/**
 * Emit portfolio update to specific user
 * @param {string} userId - User ID to send update to
 */
export function emitPortfolioUpdate(userId) {
   if (io) {
      io.to(`user:${userId}`).emit("portfolio-update", {
         message: "Portfolio updated",
         timestamp: new Date().toISOString(),
      });
      if (DEBUG.WEBSOCKET) {
         console.log("💰 Portfolio update sent to user:", userId);
      }
   }
}

/**
 * Emit trade confirmation to specific user
 * @param {string} userId - User ID
 * @param {Object} trade - Trade data
 */
export function emitTradeExecuted(userId, trade) {
   if (io) {
      io.to(`user:${userId}`).emit("trade-executed", trade);
      if (DEBUG.WEBSOCKET) {
         console.log("✅ Trade confirmation sent to user:", userId);
      }
   }
}

/**
 * Broadcast price update to all clients (for manual price updates)
 * @param {string} symbol - Stock symbol
 * @param {number} price - New price
 */
export function broadcastPriceUpdate(symbol, price) {
   if (io) {
      io.to(`market:${symbol}`).emit("price-update", {
         symbol,
         price,
         timestamp: new Date().toISOString(),
      });
   }
}

/**
 * Get list of available symbols we're tracking
 * @returns {Array} Array of symbols
 */
export function getTrackedSymbols() {
   return Array.from(connectedSymbols);
}

/**
 * Manually request historical data (useful for testing)
 * @param {string} symbol - Symbol to request
 * @param {number} limit - Number of candles
 */
export function requestHistoricalDataManual(symbol, limit = 100) {
   requestHistoricalData(symbol, limit);
}
