/**
 * Trading Routes
 * Simple routes for placing trades and managing orders
 */

import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { query, getClient } from "../db/connection.js";
import { emitTradeExecuted } from "../services/socketService.js";

const router = express.Router();

// Temporary in-memory store for mock trading (when DB is not available)
global.mockPortfolio = global.mockPortfolio || {
   balance: 100000.0,
   position: 0, // BTC quantity
   trades: [],
};
const mockPortfolio = global.mockPortfolio;

// All trading routes require authentication
router.use(requireAuth);

/**
 * Place a new trade (buy or sell)
 * POST /api/trading/trade
 */
router.post(
   "/trade",
   [
      // Validation rules
      body("symbol")
         .isLength({ min: 1, max: 10 })
         .matches(/^[A-Z]+$/)
         .withMessage("Symbol must be uppercase letters only"),

      body("side")
         .isIn(["BUY", "SELL"])
         .withMessage("Side must be BUY or SELL"),

      body("quantity")
         .isFloat({ min: 0.00000001 })
         .withMessage("Quantity must be positive number"),

      body("price")
         .isFloat({ min: 0.01 })
         .withMessage("Price must be positive number"),
   ],
   async (req, res) => {
      try {
         // Check for validation errors
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json({
               error: "Invalid input",
               details: errors.array(),
            });
         }

         const { symbol, side, quantity, price } = req.body;
         const userId = req.userId;
         const total = quantity * price;

         console.log(
            `💰 ${side} order: ${quantity} ${symbol} @ $${price} (Total: $${total})`
         );

         // Start database transaction
         const client = await getClient();

         try {
            await client.query("BEGIN");

            // Get or create user's portfolio
            let portfolio = await client.query(
               `SELECT * FROM ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.portfolios WHERE user_id = $1`,
               [userId]
            );

            if (portfolio.rows.length === 0) {
               // Create new portfolio with starting balance
               await client.query(
                  `INSERT INTO ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.portfolios (user_id, balance) VALUES ($1, $2)`,
                  [userId, 100000.0] // $100,000 starting balance
               );

               portfolio = await client.query(
                  `SELECT * FROM ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.portfolios WHERE user_id = $1`,
                  [userId]
               );
            }

            const currentBalance = parseFloat(portfolio.rows[0].balance);

            if (side === "BUY") {
               // Check if user has enough balance
               if (currentBalance < total) {
                  await client.query("ROLLBACK");
                  return res.status(400).json({
                     error: "Insufficient balance",
                     required: total,
                     available: currentBalance,
                  });
               }

               // Update balance
               await client.query(
                  `UPDATE ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.portfolios SET balance = balance - $1 WHERE user_id = $2`,
                  [total, userId]
               );

               // Add or update position
               const existingPosition = await client.query(
                  `SELECT * FROM ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.positions WHERE user_id = $1 AND symbol = $2`,
                  [userId, symbol]
               );

               if (existingPosition.rows.length > 0) {
                  // Update existing position (average price calculation)
                  const current = existingPosition.rows[0];
                  const newQuantity =
                     parseFloat(current.quantity) + parseFloat(quantity);
                  const newAvgPrice =
                     (parseFloat(current.quantity) *
                        parseFloat(current.avg_price) +
                        total) /
                     newQuantity;

                  await client.query(
                     `UPDATE ${
                        process.env.TRADING_SCHEMA || "trading_sim_schema"
                     }.positions 
             SET quantity = $1, avg_price = $2, current_price = $3, updated_at = NOW() 
             WHERE user_id = $4 AND symbol = $5`,
                     [newQuantity, newAvgPrice, price, userId, symbol]
                  );
               } else {
                  // Create new position
                  await client.query(
                     `INSERT INTO ${
                        process.env.TRADING_SCHEMA || "trading_sim_schema"
                     }.positions 
             (user_id, symbol, quantity, avg_price, current_price) 
             VALUES ($1, $2, $3, $4, $5)`,
                     [userId, symbol, quantity, price, price]
                  );
               }
            } else if (side === "SELL") {
               // Check if user has enough shares
               const position = await client.query(
                  `SELECT * FROM ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.positions WHERE user_id = $1 AND symbol = $2`,
                  [userId, symbol]
               );

               if (
                  position.rows.length === 0 ||
                  parseFloat(position.rows[0].quantity) < parseFloat(quantity)
               ) {
                  await client.query("ROLLBACK");
                  return res.status(400).json({
                     error: "Insufficient shares to sell",
                     requested: quantity,
                     available:
                        position.rows.length > 0
                           ? position.rows[0].quantity
                           : 0,
                  });
               }

               // Update balance (add money from sale)
               await client.query(
                  `UPDATE ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.portfolios SET balance = balance + $1 WHERE user_id = $2`,
                  [total, userId]
               );

               // Update position
               const newQuantity =
                  parseFloat(position.rows[0].quantity) - parseFloat(quantity);

               if (newQuantity <= 0) {
                  // Remove position entirely
                  await client.query(
                     `DELETE FROM ${
                        process.env.TRADING_SCHEMA || "trading_sim_schema"
                     }.positions WHERE user_id = $1 AND symbol = $2`,
                     [userId, symbol]
                  );
               } else {
                  // Update quantity
                  await client.query(
                     `UPDATE ${
                        process.env.TRADING_SCHEMA || "trading_sim_schema"
                     }.positions 
             SET quantity = $1, current_price = $2, updated_at = NOW() 
             WHERE user_id = $3 AND symbol = $4`,
                     [newQuantity, price, userId, symbol]
                  );
               }
            }

            // Record the trade
            const tradeResult = await client.query(
               `INSERT INTO ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.trades 
         (user_id, symbol, side, quantity, price, total) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
               [userId, symbol, side, quantity, price, total]
            );

            await client.query("COMMIT");

            const trade = tradeResult.rows[0];

            // Emit real-time update
            emitTradeExecuted(userId, trade);

            console.log("✅ Trade executed successfully:", trade.id);

            res.status(201).json({
               message: "Trade executed successfully",
               trade: trade,
            });
         } catch (error) {
            await client.query("ROLLBACK");
            throw error;
         } finally {
            client.release();
         }
      } catch (error) {
         console.error("❌ Trade execution failed:", error);
         res.status(500).json({
            error: "Trade execution failed",
            message: error.message,
         });
      }
   }
);

/**
 * Get trade history for current user
 * GET /api/trading/history
 */
router.get("/history", async (req, res) => {
   try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      // Temporary mock data when database is not available
      if (
         process.env.NODE_ENV === "development" ||
         !process.env.POSTGRES_HOST
      ) {
         const mockData = global.mockPortfolio || { trades: [] };
         const trades = mockData.trades.slice(offset, offset + limit);

         return res.json({
            trades: trades,
            total: mockData.trades.length,
            limit,
            offset,
         });
      }

      const result = await query(
         `SELECT * FROM ${
            process.env.TRADING_SCHEMA || "trading_sim_schema"
         }.trades 
       WHERE user_id = $1 
       ORDER BY executed_at DESC 
       LIMIT $2 OFFSET $3`,
         [userId, limit, offset]
      );

      res.json({
         trades: result.rows,
         total: result.rowCount,
         limit,
         offset,
      });
   } catch (error) {
      console.error("❌ Failed to get trade history:", error);
      res.status(500).json({
         error: "Failed to get trade history",
         message: error.message,
      });
   }
});

/**
 * Simplified Buy endpoint
 * POST /api/trading/buy
 */
router.post(
   "/buy",
   [
      body("symbol").isLength({ min: 1 }).withMessage("Symbol is required"),
      body("quantity")
         .isFloat({ min: 0.00000001 })
         .withMessage("Quantity must be positive"),
      body("price")
         .isFloat({ min: 0.01 })
         .withMessage("Price must be positive"),
   ],
   async (req, res) => {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json({
               error: "Invalid input",
               details: errors.array(),
            });
         }

         const { symbol, quantity, price } = req.body;
         const side = "BUY";
         const userId = req.userId;
         const total = quantity * price;

         console.log(
            `💰 ${side} order: ${quantity} ${symbol} @ $${price} (Total: $${total})`
         );

         // Temporary mock trading when database is not available
         if (
            process.env.NODE_ENV === "development" ||
            !process.env.POSTGRES_HOST
         ) {
            // Check if user has enough balance
            if (mockPortfolio.balance < total) {
               return res.status(400).json({
                  error: "Insufficient balance",
                  required: total,
                  available: mockPortfolio.balance,
               });
            }

            // Update mock portfolio
            mockPortfolio.balance -= total;
            mockPortfolio.position += parseFloat(quantity);

            // Add trade to history
            const trade = {
               id: Date.now().toString(),
               user_id: userId,
               symbol,
               side,
               quantity: parseFloat(quantity),
               price: parseFloat(price),
               total,
               executed_at: new Date().toISOString(),
            };

            mockPortfolio.trades.unshift(trade);

            console.log("✅ Mock buy order executed successfully:", trade.id);

            return res.status(201).json({
               message: "Buy order executed successfully",
               trade: trade,
            });
         }

         // Use the same logic as the main trade endpoint
         const client = await getClient();

         try {
            await client.query("BEGIN");

            // Get or create user's portfolio
            let portfolio = await client.query(
               `SELECT * FROM ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.portfolios WHERE user_id = $1`,
               [userId]
            );

            if (portfolio.rows.length === 0) {
               await client.query(
                  `INSERT INTO ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.portfolios (user_id, balance) VALUES ($1, $2)`,
                  [userId, 100000.0]
               );
               portfolio = await client.query(
                  `SELECT * FROM ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.portfolios WHERE user_id = $1`,
                  [userId]
               );
            }

            const currentBalance = parseFloat(portfolio.rows[0].balance);

            // Check if user has enough balance
            if (currentBalance < total) {
               await client.query("ROLLBACK");
               return res.status(400).json({
                  error: "Insufficient balance",
                  required: total,
                  available: currentBalance,
               });
            }

            // Update balance
            await client.query(
               `UPDATE ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.portfolios SET balance = balance - $1 WHERE user_id = $2`,
               [total, userId]
            );

            // Add or update position
            const existingPosition = await client.query(
               `SELECT * FROM ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.positions WHERE user_id = $1 AND symbol = $2`,
               [userId, symbol]
            );

            if (existingPosition.rows.length > 0) {
               const current = existingPosition.rows[0];
               const newQuantity =
                  parseFloat(current.quantity) + parseFloat(quantity);
               const newAvgPrice =
                  (parseFloat(current.quantity) *
                     parseFloat(current.avg_price) +
                     total) /
                  newQuantity;

               await client.query(
                  `UPDATE ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.positions 
                   SET quantity = $1, avg_price = $2, current_price = $3, updated_at = NOW() 
                   WHERE user_id = $4 AND symbol = $5`,
                  [newQuantity, newAvgPrice, price, userId, symbol]
               );
            } else {
               await client.query(
                  `INSERT INTO ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.positions 
                   (user_id, symbol, quantity, avg_price, current_price) 
                   VALUES ($1, $2, $3, $4, $5)`,
                  [userId, symbol, quantity, price, price]
               );
            }

            // Record the trade
            const tradeResult = await client.query(
               `INSERT INTO ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.trades 
                (user_id, symbol, side, quantity, price, total) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
               [userId, symbol, side, quantity, price, total]
            );

            await client.query("COMMIT");

            const trade = tradeResult.rows[0];
            emitTradeExecuted(userId, trade);

            console.log("✅ Buy order executed successfully:", trade.id);

            res.status(201).json({
               message: "Buy order executed successfully",
               trade: trade,
            });
         } catch (error) {
            await client.query("ROLLBACK");
            throw error;
         } finally {
            client.release();
         }
      } catch (error) {
         console.error("❌ Buy order failed:", error);
         res.status(500).json({
            error: "Buy order failed",
            message: error.message,
         });
      }
   }
);

/**
 * Simplified Sell endpoint
 * POST /api/trading/sell
 */
router.post(
   "/sell",
   [
      body("symbol").isLength({ min: 1 }).withMessage("Symbol is required"),
      body("quantity")
         .isFloat({ min: 0.00000001 })
         .withMessage("Quantity must be positive"),
      body("price")
         .isFloat({ min: 0.01 })
         .withMessage("Price must be positive"),
   ],
   async (req, res) => {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json({
               error: "Invalid input",
               details: errors.array(),
            });
         }

         const { symbol, quantity, price } = req.body;
         const side = "SELL";
         const userId = req.userId;
         const total = quantity * price;

         console.log(
            `💰 ${side} order: ${quantity} ${symbol} @ $${price} (Total: $${total})`
         );

         // Temporary mock trading when database is not available
         if (
            process.env.NODE_ENV === "development" ||
            !process.env.POSTGRES_HOST
         ) {
            // Check if user has enough shares
            if (mockPortfolio.position < parseFloat(quantity)) {
               return res.status(400).json({
                  error: "Insufficient shares to sell",
                  requested: quantity,
                  available: mockPortfolio.position,
               });
            }

            // Update mock portfolio
            mockPortfolio.balance += total;
            mockPortfolio.position -= parseFloat(quantity);

            // Add trade to history
            const trade = {
               id: Date.now().toString(),
               user_id: userId,
               symbol,
               side,
               quantity: parseFloat(quantity),
               price: parseFloat(price),
               total,
               executed_at: new Date().toISOString(),
            };

            mockPortfolio.trades.unshift(trade);

            console.log("✅ Mock sell order executed successfully:", trade.id);

            return res.status(201).json({
               message: "Sell order executed successfully",
               trade: trade,
            });
         }

         const client = await getClient();

         try {
            await client.query("BEGIN");

            // Check if user has enough shares
            const position = await client.query(
               `SELECT * FROM ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.positions WHERE user_id = $1 AND symbol = $2`,
               [userId, symbol]
            );

            if (
               position.rows.length === 0 ||
               parseFloat(position.rows[0].quantity) < parseFloat(quantity)
            ) {
               await client.query("ROLLBACK");
               return res.status(400).json({
                  error: "Insufficient shares to sell",
                  requested: quantity,
                  available:
                     position.rows.length > 0 ? position.rows[0].quantity : 0,
               });
            }

            // Update balance (add money from sale)
            await client.query(
               `UPDATE ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.portfolios SET balance = balance + $1 WHERE user_id = $2`,
               [total, userId]
            );

            // Update position
            const newQuantity =
               parseFloat(position.rows[0].quantity) - parseFloat(quantity);

            if (newQuantity <= 0) {
               await client.query(
                  `DELETE FROM ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.positions WHERE user_id = $1 AND symbol = $2`,
                  [userId, symbol]
               );
            } else {
               await client.query(
                  `UPDATE ${
                     process.env.TRADING_SCHEMA || "trading_sim_schema"
                  }.positions 
                   SET quantity = $1, current_price = $2, updated_at = NOW() 
                   WHERE user_id = $3 AND symbol = $4`,
                  [newQuantity, price, userId, symbol]
               );
            }

            // Record the trade
            const tradeResult = await client.query(
               `INSERT INTO ${
                  process.env.TRADING_SCHEMA || "trading_sim_schema"
               }.trades 
                (user_id, symbol, side, quantity, price, total) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
               [userId, symbol, side, quantity, price, total]
            );

            await client.query("COMMIT");

            const trade = tradeResult.rows[0];
            emitTradeExecuted(userId, trade);

            console.log("✅ Sell order executed successfully:", trade.id);

            res.status(201).json({
               message: "Sell order executed successfully",
               trade: trade,
            });
         } catch (error) {
            await client.query("ROLLBACK");
            throw error;
         } finally {
            client.release();
         }
      } catch (error) {
         console.error("❌ Sell order failed:", error);
         res.status(500).json({
            error: "Sell order failed",
            message: error.message,
         });
      }
   }
);

/**
 * Get available symbol for trading (only BTCUSDT)
 * GET /api/trading/symbols
 */
router.get("/symbols", (req, res) => {
   // Only BTCUSDT is available from the data server
   const symbols = [
      {
         symbol: "BTCUSDT",
         name: "Bitcoin",
         description: "Bitcoin vs Tether USD",
         type: "crypto",
         baseCurrency: "BTC",
         quoteCurrency: "USDT",
      },
   ];

   res.json({
      symbols,
      message: "Available symbol for trading",
      note: "Only BTCUSDT is supported - this is a Bitcoin trading simulator",
   });
});

export default router;
