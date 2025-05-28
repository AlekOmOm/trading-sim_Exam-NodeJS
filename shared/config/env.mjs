/**
 * Shared Environment Configuration for Trading Simulator
 *
 * This module provides a centralized, type-safe way to access environment
 * variables across the entire trading simulator application.
 *
 * Follows the same pattern as auth-system for consistency.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables from root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

/**
 * Environment validation helper
 */
const requireEnv = (key, defaultValue = null) => {
   const value = process.env[key] || defaultValue;
   if (value === null) {
      throw new Error(`Required environment variable ${key} is not set`);
   }
   return value;
};

/**
 * Application Configuration
 */
export const APP = {
   NODE_ENV: process.env.NODE_ENV || "development",

   // Determine if we're in production
   IS_PRODUCTION: process.env.NODE_ENV === "production",
   IS_DEVELOPMENT: process.env.NODE_ENV === "development",

   // Frontend Configuration
   FRONTEND: {
      PORT: parseInt(
         process.env.FRONTEND_PORT || process.env.DEV_FRONTEND_PORT || "5173",
         10
      ),
      HOST: process.env.FRONTEND_HOST || "localhost",
      URL:
         process.env.FRONTEND_URL ||
         `http://${process.env.FRONTEND_HOST || "localhost"}:${
            process.env.FRONTEND_PORT || process.env.DEV_FRONTEND_PORT || "5173"
         }`,
   },

   // Backend Configuration
   BACKEND: {
      PORT: parseInt(
         process.env.BACKEND_PORT || process.env.DEV_BACKEND_PORT || "4000",
         10
      ),
      HOST: process.env.BACKEND_HOST || "localhost",
      URL:
         process.env.BACKEND_URL ||
         `http://${process.env.BACKEND_HOST || "localhost"}:${
            process.env.BACKEND_PORT || process.env.DEV_BACKEND_PORT || "4000"
         }`,
   },

   // Security
   SESSION_SECRET: requireEnv(
      "SESSION_SECRET",
      "your-super-secret-key-change-this"
   ),

   // CORS & Rate Limiting
   ALLOWED_CLIENT_ORIGINS: (process.env.ALLOWED_CLIENT_ORIGINS || "")
      .split(",")
      .filter(Boolean),
   RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "15", 10),
   RATE_LIMIT_LIMIT: parseInt(process.env.RATE_LIMIT_LIMIT || "300", 10),
};

/**
 * Database Configuration
 */
export const DATABASE = {
   // PostgreSQL Configuration (uses same PostgreSQL instance as Auth-System)
   POSTGRES: {
      host: process.env.POSTGRES_HOST || "localhost",
      port: parseInt(
         process.env.POSTGRES_PORT || process.env.DEV_DB_PORT || "5432",
         10
      ),
      database: process.env.POSTGRES_DB || "trading_sim",
      user: process.env.POSTGRES_USER || "devalek",
      password: process.env.POSTGRES_PASSWORD || "cmWpJPpfgEbvzDPiwbF6",
   },

   // Trading Schema
   TRADING_SCHEMA: process.env.TRADING_SCHEMA || "trading_sim_schema",
};

/**
 * Auth-System Integration Configuration
 */
export const AUTH_SYSTEM = {
   // Base URLs
   SYSTEM_URL: process.env.AUTH_SYSTEM_URL || "http://localhost:3000",
   API_URL: process.env.AUTH_API_URL || "http://localhost:3003/api",

   // Client Server Credentials (set after registration)
   CLIENT_ID: process.env.CLIENT_SERVER_ID || "",
   CLIENT_SECRET: process.env.CLIENT_SERVER_SECRET || "",

   // Schema assigned by auth-system
   ASSIGNED_SCHEMA: process.env.TRADING_SCHEMA || "trading_sim_schema",

   // Allowed return URLs for auth integration
   ALLOWED_RETURN_URLS: [
      APP.FRONTEND.URL,
      `${APP.FRONTEND.URL}/`,
      `${APP.FRONTEND.URL}/dashboard`,
      `${APP.FRONTEND.URL}/profile`,
      `${APP.BACKEND.URL}`,
      // Add any additional URLs as needed
   ],

   // Auth redirect endpoints
   LOGIN_URL: `${process.env.AUTH_SYSTEM_URL || "http://localhost:3000"}/login`,
   REGISTER_URL: `${
      process.env.AUTH_SYSTEM_URL || "http://localhost:3000"
   }/register`,
};

/**
 * External Services Configuration
 */
export const EXTERNAL_SERVICES = {
   // Real-time data server
   DATA_SERVER: {
      URL: process.env.DATA_SERVER_URL || "wss://candle-data.devalek.dev",
      // Add reconnection settings, auth tokens, etc. as needed
   },
};

/**
 * Debug Configuration
 */
export const DEBUG = {
   AUTH: process.env.DEBUG_AUTH === "true",
   TRADING: process.env.DEBUG_TRADING === "true",
   WEBSOCKET: process.env.DEBUG_WEBSOCKET === "true",
   DATABASE: process.env.DEBUG_DATABASE === "true",
};

/**
 * Complete environment configuration object
 */
const config = {
   APP,
   DATABASE,
   AUTH_SYSTEM,
   EXTERNAL_SERVICES,
   DEBUG,
};

/**
 * Validation function to ensure required environment variables are set
 */
export const validateConfig = () => {
   const errors = [];

   // Check critical configuration
   if (
      !config.APP.SESSION_SECRET ||
      config.APP.SESSION_SECRET === "your-super-secret-key-change-this"
   ) {
      errors.push("SESSION_SECRET must be set to a secure value");
   }

   if (!config.AUTH_SYSTEM.CLIENT_ID && config.APP.IS_PRODUCTION) {
      errors.push("CLIENT_SERVER_ID must be set in production");
   }

   if (!config.AUTH_SYSTEM.CLIENT_SECRET && config.APP.IS_PRODUCTION) {
      errors.push("CLIENT_SERVER_SECRET must be set in production");
   }

   if (errors.length > 0) {
      console.error("❌ Environment Configuration Errors:");
      errors.forEach((error) => console.error(`   - ${error}`));

      if (config.APP.IS_PRODUCTION) {
         throw new Error("Invalid environment configuration for production");
      } else {
         console.warn(
            "⚠️  Environment configuration warnings (development mode)"
         );
      }
   }

   return true;
};

/**
 * Log current configuration (safe for development)
 */
export const logConfig = () => {
   if (config.APP.IS_DEVELOPMENT) {
      console.log("🔧 Trading Simulator Configuration:");
      console.log(`   Frontend: ${config.APP.FRONTEND.URL}`);
      console.log(`   Backend: ${config.APP.BACKEND.URL}`);
      console.log(`   Auth System: ${config.AUTH_SYSTEM.SYSTEM_URL}`);
      console.log(`   Auth API: ${config.AUTH_SYSTEM.API_URL}`);
      console.log(
         `   Database: ${config.DATABASE.POSTGRES.host}:${config.DATABASE.POSTGRES.port}/${config.DATABASE.POSTGRES.database}`
      );
      console.log(`   Trading Schema: ${config.DATABASE.TRADING_SCHEMA}`);

      if (config.AUTH_SYSTEM.CLIENT_ID) {
         console.log(`   Client ID: ${config.AUTH_SYSTEM.CLIENT_ID}`);
         console.log(
            `   Client Secret: ${
               config.AUTH_SYSTEM.CLIENT_SECRET ? "[SET]" : "[NOT SET]"
            }`
         );
      } else {
         console.log("   Client Credentials: [NOT CONFIGURED]");
      }
   }
};

export default config;
