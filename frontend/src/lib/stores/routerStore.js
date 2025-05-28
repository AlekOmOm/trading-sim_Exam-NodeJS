import { writable } from "svelte/store";

// Simple router store for basic routing
export const currentRoute = writable("/");

// Function to navigate to a route
export function navigate(route) {
   currentRoute.set(route);
   // Update browser URL without page reload
   window.history.pushState({}, "", route);
}

// Function to get current route from URL
export function getCurrentRoute() {
   return window.location.pathname;
}

// Initialize router on page load
export function initRouter() {
   // Set initial route from URL
   currentRoute.set(getCurrentRoute());

   // Handle browser back/forward buttons
   window.addEventListener("popstate", () => {
      currentRoute.set(getCurrentRoute());
   });
}

// Route constants
export const ROUTES = {
   HOME: "/home",
   DASHBOARD: "/",
};
