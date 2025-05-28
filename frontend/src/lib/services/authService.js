import { AUTH_SYSTEM_URL, AUTH_API_URL } from "../authConfig"; // Adjusted path
import { user, isLoadingAuth, authError } from "../stores/authStore";

class AuthService {
   constructor() {
      this.authSystemUrl = AUTH_SYSTEM_URL; // For redirects to login page
      this.authApiUrl = AUTH_API_URL; // For API calls
      this.isCheckingAuth = false;
   }

   async checkAuth() {
      // Prevent multiple simultaneous auth checks
      if (this.isCheckingAuth) {
         return null;
      }

      this.isCheckingAuth = true;

      try {
         // Use the auth-system API backend (port 3003)
         const response = await fetch(`${this.authApiUrl}/auth/session`, {
            credentials: "include", // Include cookies
         });

         if (response.ok) {
            const authData = await response.json();
            // Update the store directly
            user.set(authData.user || authData.data || authData);
            authError.set(null);
            return authData;
         } else {
            user.set(null);
            return null;
         }
      } catch (error) {
         console.error("Auth check failed:", error);
         user.set(null);
         authError.set(error.message || "Authentication check failed");
         return null;
      } finally {
         this.isCheckingAuth = false;
      }
   }

   redirectToLogin() {
      // Use the current frontend page URL, but if we're on /home, redirect to dashboard instead
      let returnUrl = window.location.href;
      if (window.location.pathname === "/home") {
         // If coming from landing page, redirect to main dashboard after login
         returnUrl = window.location.origin + "/";
      }
      const encodedReturnUrl = encodeURIComponent(returnUrl);
      // Redirect to auth-system frontend (port 3000)
      window.location.href = `${this.authSystemUrl}/login?return_url=${encodedReturnUrl}`;
   }

   redirectToRegister() {
      // Use the current frontend page URL, but if we're on /home, redirect to dashboard instead
      let returnUrl = window.location.href;
      if (window.location.pathname === "/home") {
         // If coming from landing page, redirect to main dashboard after registration
         returnUrl = window.location.origin + "/";
      }
      const encodedReturnUrl = encodeURIComponent(returnUrl);
      // Redirect to auth-system frontend (port 3000) register page
      window.location.href = `${this.authSystemUrl}/register?return_url=${encodedReturnUrl}`;
   }

   async logout() {
      try {
         // Use auth-system API backend (port 3003)
         await fetch(`${this.authApiUrl}/auth/logout`, {
            method: "POST",
            credentials: "include",
         });
         // Clear the user store
         user.set(null);
         authError.set(null);
         // Redirect to landing page after logout
         window.location.href = "/home";
      } catch (error) {
         console.error("Logout failed:", error);
         authError.set("Logout failed");
      }
   }

   // Method to manually refresh auth state (useful after login redirect)
   async refreshAuthState() {
      isLoadingAuth.set(true);
      try {
         await this.checkAuth();
      } finally {
         isLoadingAuth.set(false);
      }
   }
}

export default new AuthService();
