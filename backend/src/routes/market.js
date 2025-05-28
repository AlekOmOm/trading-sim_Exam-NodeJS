/**
 * Market Data Routes
 * Simple routes for BTCUSDT trading (only symbol available)
 */

import express from "express";
import { getTrackedSymbols } from "../services/socketService.js";
import { EXTERNAL_SERVICES } from "../../../shared/config/env.mjs";

const router = express.Router();

/**
 * Get available trading symbol (only BTCUSDT)
 * GET /api/market/symbols
 */
router.get("/symbols", (req, res) => {
   // Only BTCUSDT is available from the data server
   const symbols = [
      {
         symbol: "BTCUSDT",
         name: "Bitcoin",
         type: "crypto",
         description: "Bitcoin vs Tether USD",
         baseCurrency: "BTC",
         quoteCurrency: "USDT",
      },
   ];

   res.json({
      symbols,
      message: "Available symbol for trading",
      note: "Only BTCUSDT is available from the data server",
   });
});

/**
 * Get currently tracked symbols
 * GET /api/market/tracked
 */
router.get("/tracked", (req, res) => {
   const trackedSymbols = getTrackedSymbols();

   res.json({
      trackedSymbols,
      count: trackedSymbols.length,
      message: "Symbols currently being tracked for market data",
      note: "Historical data is automatically requested when frontend connects",
   });
});

/**
 * Data server connection status
 * GET /api/market/status
 */
router.get("/status", (req, res) => {
   const trackedSymbols = getTrackedSymbols();

   res.json({
      dataServerUrl: EXTERNAL_SERVICES.DATA_SERVER.URL,
      availableSymbol: "BTCUSDT",
      trackedSymbols,
      trackedCount: trackedSymbols.length,
      message: "Market data service status",
      note: "Only BTCUSDT is supported for trading",
   });
});

export default router;
