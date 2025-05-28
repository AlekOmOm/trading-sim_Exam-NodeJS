/**
 * Portfolio Routes
 * Simple routes for managing user portfolio and positions
 */

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { query, getClient } from "../db/connection.js";

const router = express.Router();

// Import mock portfolio for development (shared with trading routes)
const getMockPortfolio = () => {
   // This would ideally be shared from a common module, but for simplicity:
   return (
      global.mockPortfolio || {
         balance: 100000.0,
         position: 0,
         trades: [],
      }
   );
};

// Get current market price from the latest trade or market data
const getCurrentBTCPrice = () => {
   // Try to get current price from global market data (if available from WebSocket)
   if (global.currentMarketPrice && global.currentMarketPrice.BTCUSDT) {
      return global.currentMarketPrice.BTCUSDT;
   }

   const mockData = getMockPortfolio();
   if (mockData.trades && mockData.trades.length > 0) {
      // Use the price from the most recent trade
      return mockData.trades[0].price;
   }
   // Fallback to a reasonable current BTC price
   return 107000; // Approximate current BTC price
};

// All portfolio routes require authentication
router.use(requireAuth);

/**
 * Get user's portfolio summary
 * GET /api/portfolio
 */
router.get("/", async (req, res) => {
   try {
      const userId = req.userId;

      // Temporary mock data when database is not available
      if (
         process.env.NODE_ENV === "development" ||
         !process.env.POSTGRES_HOST
      ) {
         const mockData = getMockPortfolio();
         const positionValue = mockData.position * getCurrentBTCPrice();
         const totalValue = mockData.balance + positionValue;
         const totalPnL = totalValue - 100000; // Starting balance was $100k

         return res.json({
            balance: mockData.balance,
            totalPositionValue: positionValue,
            totalValue: totalValue,
            totalPnL: totalPnL,
            totalUnrealizedPnL: totalPnL,
            positionsCount: mockData.position > 0 ? 1 : 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
         });
      }

      // Get or create portfolio
      let portfolio = await query(
         `SELECT * FROM ${
            process.env.TRADING_SCHEMA || "trading_sim_schema"
         }.portfolios WHERE user_id = $1`,
         [userId]
      );

      if (portfolio.rows.length === 0) {
         // Create new portfolio with starting balance
         await query(
            `INSERT INTO ${
               process.env.TRADING_SCHEMA || "trading_sim_schema"
            }.portfolios (user_id, balance) VALUES ($1, $2)`,
            [userId, 100000.0]
         );

         portfolio = await query(
            `SELECT * FROM ${
               process.env.TRADING_SCHEMA || "trading_sim_schema"
            }.portfolios WHERE user_id = $1`,
            [userId]
         );
      }

      // Get current positions
      const positions = await query(
         `SELECT * FROM ${
            process.env.TRADING_SCHEMA || "trading_sim_schema"
         }.positions WHERE user_id = $1`,
         [userId]
      );

      // Calculate total position value and P&L
      let totalPositionValue = 0;
      let totalUnrealizedPnL = 0;

      positions.rows.forEach((position) => {
         const positionValue =
            parseFloat(position.quantity) *
            parseFloat(position.current_price || position.avg_price);
         const unrealizedPnL =
            parseFloat(position.quantity) *
            (parseFloat(position.current_price || position.avg_price) -
               parseFloat(position.avg_price));

         totalPositionValue += positionValue;
         totalUnrealizedPnL += unrealizedPnL;
      });

      const portfolioData = portfolio.rows[0];
      const totalValue = parseFloat(portfolioData.balance) + totalPositionValue;
      const totalPnL = totalValue - 100000; // Starting balance was $100,000

      res.json({
         balance: parseFloat(portfolioData.balance),
         totalPositionValue,
         totalValue,
         totalPnL,
         totalUnrealizedPnL,
         positionsCount: positions.rows.length,
         createdAt: portfolioData.created_at,
         updatedAt: portfolioData.updated_at,
      });
   } catch (error) {
      console.error("❌ Failed to get portfolio:", error);
      res.status(500).json({
         error: "Failed to get portfolio",
         message: error.message,
      });
   }
});

/**
 * Get user's current positions
 * GET /api/portfolio/positions
 */
router.get("/positions", async (req, res) => {
   try {
      const userId = req.userId;

      // Temporary mock data when database is not available
      if (
         process.env.NODE_ENV === "development" ||
         !process.env.POSTGRES_HOST
      ) {
         const mockData = getMockPortfolio();
         const positions = [];

         if (mockData.position > 0) {
            positions.push({
               id: "mock-position-1",
               symbol: "BTCUSDT",
               quantity: mockData.position,
               avgPrice: getCurrentBTCPrice(), // Use current BTC price
               currentPrice: getCurrentBTCPrice(), // Use current BTC price
               positionValue: mockData.position * getCurrentBTCPrice(),
               unrealizedPnL: 0, // No profit since avg = current for mock
               pnlPercentage: 0,
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString(),
            });
         }

         return res.json({
            positions: positions,
            totalPositions: positions.length,
         });
      }

      const positions = await query(
         `SELECT 
         p.*,
         (p.quantity * p.current_price) as position_value,
         (p.quantity * (p.current_price - p.avg_price)) as unrealized_pnl,
         ((p.current_price - p.avg_price) / p.avg_price * 100) as pnl_percentage
       FROM ${process.env.TRADING_SCHEMA || "trading_sim_schema"}.positions p 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
         [userId]
      );

      // Format the data for better readability
      const formattedPositions = positions.rows.map((position) => ({
         id: position.id,
         symbol: position.symbol,
         quantity: parseFloat(position.quantity),
         avgPrice: parseFloat(position.avg_price),
         currentPrice: parseFloat(position.current_price || position.avg_price),
         positionValue: parseFloat(position.position_value || 0),
         unrealizedPnL: parseFloat(position.unrealized_pnl || 0),
         pnlPercentage: parseFloat(position.pnl_percentage || 0),
         createdAt: position.created_at,
         updatedAt: position.updated_at,
      }));

      res.json({
         positions: formattedPositions,
         totalPositions: formattedPositions.length,
      });
   } catch (error) {
      console.error("❌ Failed to get positions:", error);
      res.status(500).json({
         error: "Failed to get positions",
         message: error.message,
      });
   }
});

/**
 * Get portfolio performance data
 * GET /api/portfolio/performance
 */
router.get("/performance", async (req, res) => {
   try {
      const userId = req.userId;

      // Get trade statistics
      const tradeStats = await query(
         `SELECT 
         COUNT(*) as total_trades,
         COUNT(CASE WHEN side = 'BUY' THEN 1 END) as buy_trades,
         COUNT(CASE WHEN side = 'SELL' THEN 1 END) as sell_trades,
         SUM(CASE WHEN side = 'BUY' THEN total ELSE 0 END) as total_bought,
         SUM(CASE WHEN side = 'SELL' THEN total ELSE 0 END) as total_sold,
         AVG(total) as avg_trade_size
       FROM ${process.env.TRADING_SCHEMA || "trading_sim_schema"}.trades 
       WHERE user_id = $1`,
         [userId]
      );

      // Get monthly trade activity (last 6 months)
      const monthlyActivity = await query(
         `SELECT 
         DATE_TRUNC('month', executed_at) as month,
         COUNT(*) as trade_count,
         SUM(total) as total_volume
       FROM ${process.env.TRADING_SCHEMA || "trading_sim_schema"}.trades 
       WHERE user_id = $1 
         AND executed_at >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', executed_at)
       ORDER BY month DESC`,
         [userId]
      );

      // Get most traded symbols
      const topSymbols = await query(
         `SELECT 
         symbol,
         COUNT(*) as trade_count,
         SUM(total) as total_volume
       FROM ${process.env.TRADING_SCHEMA || "trading_sim_schema"}.trades 
       WHERE user_id = $1 
       GROUP BY symbol 
       ORDER BY trade_count DESC 
       LIMIT 5`,
         [userId]
      );

      const stats = tradeStats.rows[0];

      res.json({
         totalTrades: parseInt(stats.total_trades || 0),
         buyTrades: parseInt(stats.buy_trades || 0),
         sellTrades: parseInt(stats.sell_trades || 0),
         totalBought: parseFloat(stats.total_bought || 0),
         totalSold: parseFloat(stats.total_sold || 0),
         avgTradeSize: parseFloat(stats.avg_trade_size || 0),
         monthlyActivity: monthlyActivity.rows,
         topSymbols: topSymbols.rows,
      });
   } catch (error) {
      console.error("❌ Failed to get performance data:", error);
      res.status(500).json({
         error: "Failed to get performance data",
         message: error.message,
      });
   }
});

/**
 * Reset portfolio to starting balance (for testing)
 * POST /api/portfolio/reset
 */
router.post("/reset", async (req, res) => {
   try {
      const userId = req.userId;

      console.log("🔄 Resetting portfolio for user:", userId);

      const client = await getClient();

      try {
         await client.query("BEGIN");

         // Delete all positions
         await client.query(
            `DELETE FROM ${
               process.env.TRADING_SCHEMA || "trading_sim_schema"
            }.positions WHERE user_id = $1`,
            [userId]
         );

         // Delete all trades
         await client.query(
            `DELETE FROM ${
               process.env.TRADING_SCHEMA || "trading_sim_schema"
            }.trades WHERE user_id = $1`,
            [userId]
         );

         // Reset portfolio balance
         await client.query(
            `UPDATE ${
               process.env.TRADING_SCHEMA || "trading_sim_schema"
            }.portfolios 
         SET balance = $1, updated_at = NOW() 
         WHERE user_id = $2`,
            [100000.0, userId]
         );

         await client.query("COMMIT");

         console.log("✅ Portfolio reset successfully");

         res.json({
            message: "Portfolio reset successfully",
            newBalance: 100000.0,
         });
      } catch (error) {
         await client.query("ROLLBACK");
         throw error;
      } finally {
         client.release();
      }
   } catch (error) {
      console.error("❌ Failed to reset portfolio:", error);
      res.status(500).json({
         error: "Failed to reset portfolio",
         message: error.message,
      });
   }
});

export default router;
