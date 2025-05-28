// Simple formatting utilities for the trading app

/**
 * Format a number as currency (e.g., 1234.56 -> "$1,234.56")
 */
export function formatCurrency(amount) {
   if (amount === null || amount === undefined) return "--";

   return (
      "$" +
      amount.toLocaleString("en-US", {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
      })
   );
}

/**
 * Format a percentage (e.g., 0.1234 -> "12.34%")
 */
export function formatPercentage(decimal) {
   if (decimal === null || decimal === undefined) return "--";

   return (decimal * 100).toFixed(2) + "%";
}

/**
 * Format Bitcoin quantity (e.g., 0.12345678 -> "0.12345678 BTC")
 */
export function formatBitcoin(amount) {
   if (amount === null || amount === undefined) return "--";

   return amount.toFixed(8) + " BTC";
}

/**
 * Format large numbers with K, M, B suffixes (e.g., 1234567 -> "1.23M")
 */
export function formatLargeNumber(num) {
   if (num === null || num === undefined) return "--";

   if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
   }
   if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
   }
   if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
   }
   return num.toString();
}

/**
 * Format time ago (e.g., "2 minutes ago")
 */
export function timeAgo(timestamp) {
   if (!timestamp) return "--";

   const now = Date.now();
   const diff = now - timestamp;
   const seconds = Math.floor(diff / 1000);
   const minutes = Math.floor(seconds / 60);
   const hours = Math.floor(minutes / 60);

   if (seconds < 60) return "Just now";
   if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
   if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

   return new Date(timestamp).toLocaleDateString();
}

/**
 * Check if a price change is positive
 */
export function isPricePositive(change) {
   return change > 0;
}

/**
 * Get the right CSS class for profit/loss display
 */
export function getProfitLossClass(amount) {
   if (amount > 0) return "text-profit";
   if (amount < 0) return "text-loss";
   return "text-neutral";
}
