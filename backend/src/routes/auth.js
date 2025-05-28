/**
 * Authentication Routes
 * Simple routes for integrating with Auth-System
 */

import express from "express";
const router = express.Router();

import { AUTH_SYSTEM, APP } from "../../../shared/config/env.mjs";

/**
 * Validate current session with Auth-System
 * This endpoint checks if the user is logged in
 */
router.get("/validate", async (req, res) => {
   try {
      // Check session with Auth-System
      const response = await fetch(`${AUTH_SYSTEM.API_URL}/auth/session`, {
         headers: {
            Cookie: req.headers.cookie || "",
         },
      });

      if (!response.ok) {
         return res.status(401).json({
            error: "Not authenticated",
            redirectUrl: `${
               AUTH_SYSTEM.SYSTEM_URL
            }/login?return_url=${encodeURIComponent(
               req.get("referer") || APP.FRONTEND.URL
            )}`,
         });
      }

      const sessionData = await response.json();

      // Return user info
      res.json({
         user: sessionData.user,
         userId: sessionData.userId,
         isAuthenticated: true,
      });
   } catch (error) {
      console.error("Auth validation failed:", error);
      res.status(500).json({
         error: "Authentication service unavailable",
      });
   }
});

/**
 * Get current user info
 * Returns detailed user information if authenticated
 */
router.get("/me", async (req, res) => {
   try {
      // Validate session first
      const response = await fetch(`${AUTH_SYSTEM.API_URL}/auth/session`, {
         headers: {
            Cookie: req.headers.cookie || "",
         },
      });

      if (!response.ok) {
         return res.status(401).json({ error: "Not authenticated" });
      }

      const sessionData = await response.json();
      res.json(sessionData.user);
   } catch (error) {
      console.error("Failed to get user info:", error);
      res.status(500).json({ error: "Failed to get user information" });
   }
});

/**
 * Logout endpoint
 * Redirects to Auth-System logout
 */
router.post("/logout", (req, res) => {
   res.json({
      message: "Logout successful",
      redirectUrl: `${AUTH_SYSTEM.SYSTEM_URL}/logout`,
   });
});

export default router;
