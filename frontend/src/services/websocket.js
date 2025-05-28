// Simple WebSocket service for real-time data
import { marketStore } from "../stores/marketStore.js";
import { portfolioStore } from "../stores/portfolioStore.js";

class WebSocketService {
   constructor() {
      this.socket = null;
      this.isConnected = false;
   }

   // Connect to the backend WebSocket
   connect() {
      try {
         // Import Socket.IO client dynamically to keep bundle smaller
         import("socket.io-client").then(({ io }) => {
            this.socket = io("http://localhost:4000", {
               withCredentials: true,
            });

            // Handle connection events
            this.socket.on("connect", () => {
               console.log("Connected to trading server");
               this.isConnected = true;
               marketStore.setConnected(true);

               // Subscribe to Bitcoin price updates
               this.socket.emit("subscribe", { symbols: ["BTCUSDT"] });
            });

            this.socket.on("disconnect", () => {
               console.log("Disconnected from trading server");
               this.isConnected = false;
               marketStore.setConnected(false);
            });

            // Handle real-time price updates
            this.socket.on("candle", (data) => {
               if (data.symbol === "BTCUSDT") {
                  marketStore.updateCandle({
                     open: data.open,
                     high: data.high,
                     low: data.low,
                     close: data.close,
                     volume: data.volume,
                  });
               }
            });

            // Handle portfolio updates after trades
            this.socket.on("portfolio-update", () => {
               portfolioStore.refresh();
            });

            // Handle trade confirmations
            this.socket.on("trade-executed", (trade) => {
               portfolioStore.addTrade(trade);
            });

            // Handle connection errors
            this.socket.on("connect_error", (error) => {
               console.error("WebSocket connection error:", error);
               marketStore.setConnected(false);
            });
         });
      } catch (error) {
         console.error("Failed to setup WebSocket:", error);
      }
   }

   // Disconnect from WebSocket
   disconnect() {
      if (this.socket) {
         this.socket.disconnect();
         this.socket = null;
         this.isConnected = false;
         marketStore.setConnected(false);
      }
   }

   // Check if connected
   isSocketConnected() {
      return this.isConnected;
   }
}

// Create and export a single instance
export const websocketService = new WebSocketService();
