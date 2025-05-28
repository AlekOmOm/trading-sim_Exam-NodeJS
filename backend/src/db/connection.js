/**
 * Database Configuration
 * PostgreSQL connection setup using unified environment system
 */
import pkg from "pg";
const { Pool } = pkg;

import { DATABASE, DEBUG } from "../../../shared/config/env.mjs";

// Create connection pool using new environment system
const pool = new Pool(DATABASE.POSTGRES);

/**
 * Connect to the database and test the connection
 */
export async function connectDatabase() {
   try {
      // Test the connection
      const client = await pool.connect();

      if (DEBUG.DATABASE) {
         console.log("🔍 Database connection details:", {
            host: DATABASE.POSTGRES.host,
            port: DATABASE.POSTGRES.port,
            database: DATABASE.POSTGRES.database,
            user: DATABASE.POSTGRES.user,
            schema: DATABASE.TRADING_SCHEMA,
         });
      }

      console.log("✅ Connected to PostgreSQL database");

      // Create our schema if it doesn't exist
      await client.query(
         `CREATE SCHEMA IF NOT EXISTS ${DATABASE.TRADING_SCHEMA}`
      );

      console.log(`📊 Trading schema '${DATABASE.TRADING_SCHEMA}' ready`);

      client.release();
      return true;
   } catch (error) {
      console.error("❌ Database connection failed:", error.message);

      if (DEBUG.DATABASE) {
         console.error("Full error details:", error);
      }

      throw error;
   }
}

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
export async function query(text, params) {
   const start = Date.now();

   try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;

      if (DEBUG.DATABASE) {
         console.log("🔍 Database query executed:", {
            query: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
            duration: `${duration}ms`,
            rows: result.rowCount,
         });
      }

      return result;
   } catch (error) {
      const duration = Date.now() - start;

      console.error("❌ Database query failed:", {
         query: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
         duration: `${duration}ms`,
         error: error.message,
      });

      throw error;
   }
}

/**
 * Get a client from the pool for transactions
 * @returns {Object} Database client
 */
export async function getClient() {
   return await pool.connect();
}

/**
 * Execute a transaction with automatic rollback on error
 * @param {Function} callback - Transaction callback function
 * @returns {*} Transaction result
 */
export async function transaction(callback) {
   const client = await getClient();

   try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");

      if (DEBUG.DATABASE) {
         console.log("✅ Transaction committed successfully");
      }

      return result;
   } catch (error) {
      await client.query("ROLLBACK");

      console.error("❌ Transaction rolled back:", error.message);
      throw error;
   } finally {
      client.release();
   }
}

/**
 * Health check for database connection
 * @returns {Object} Health status
 */
export async function healthCheck() {
   try {
      const start = Date.now();
      const result = await query("SELECT NOW() as timestamp, version()");
      const duration = Date.now() - start;

      return {
         status: "healthy",
         timestamp: result.rows[0].timestamp,
         version: result.rows[0].version,
         responseTime: `${duration}ms`,
         schema: DATABASE.TRADING_SCHEMA,
      };
   } catch (error) {
      return {
         status: "unhealthy",
         error: error.message,
         schema: DATABASE.TRADING_SCHEMA,
      };
   }
}

export { pool };
