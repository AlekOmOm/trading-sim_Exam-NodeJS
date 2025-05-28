/**
 * Authentication Middleware
 * Simple middleware to check if user is logged in via Auth-System
 */

/**
 * Middleware to require authentication
 * Checks session with Auth-System and adds user info to request
 */
import { AUTH_SYSTEM } from "../../../shared/config/env.mjs";

export async function requireAuth(req, res, next) {
   try {
      // Check session with Auth-System
      const response = await fetch(`${AUTH_SYSTEM.API_URL}/auth/session`, {
         headers: {
            Cookie: req.headers.cookie || "",
         },
      });

      if (!response.ok) {
         return res.status(401).json({
            error: "Authentication required",
            message: "Please log in to access this resource",
            /**
             * redirect to login page
             * - req.originalUrl: the url of the page that the user is trying to access
             * - AUTH_SYSTEM.LOGIN_URL: the url of the auth-system
             * - encodeURIComponent(req.originalUrl):
             *    - encode the url to be used in the redirect
             *    - this is to ensure that the url is valid and can be used in the redirect
             *    - without this, the url would be encoded as %20, %21, etc.
             *    - which would break the redirect
             */
            redirectUrl: `${
               AUTH_SYSTEM.LOGIN_URL
            }?return_url=${encodeURIComponent(req.originalUrl)}`,
         });
      }

      const sessionData = await response.json();

      // Add user info to request object
      req.user = sessionData.user;
      req.userId = sessionData.userId;

      // Continue to next middleware/route
      next();
   } catch (error) {
      console.error("Auth validation failed:", error);
      res.status(500).json({
         error: "Authentication service unavailable",
         message: "Could not verify your login status. Please try again.",
      });
   }
}

/**
 * Optional authentication middleware
 * Adds user info if logged in, but doesn't require it
 * - fx for home page
 */
export async function optionalAuth(req, res, next) {
   try {
      const response = await fetch(`${AUTH_SYSTEM.API_URL}/auth/session`, {
         headers: {
            Cookie: req.headers.cookie || "",
         },
      });

      if (response.ok) {
         const sessionData = await response.json();
         req.user = sessionData.user;
         req.userId = sessionData.userId;
      }

      next();
   } catch (error) {
      console.error("Optional auth check failed:", error);
      next();
   }
}
