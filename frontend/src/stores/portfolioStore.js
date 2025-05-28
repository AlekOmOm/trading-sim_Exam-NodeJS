// Simple portfolio store
import { writable } from "svelte/store";

// Create a store for portfolio data
function createPortfolioStore() {
   const { subscribe, set, update } = writable({
      balance: 100000, // Starting with $100,000
      position: 0, // How much Bitcoin we own
      totalValue: 100000, // Total portfolio value
      trades: [], // List of completed trades
   });

   return {
      subscribe,

      // Refresh portfolio data from backend
      async refresh() {
         try {
            // Get portfolio summary
            const portfolioResponse = await fetch("/api/portfolio", {
               credentials: "include",
            });

            // Get positions
            const positionsResponse = await fetch("/api/portfolio/positions", {
               credentials: "include",
            });

            // Get recent trades
            const tradesResponse = await fetch(
               "/api/trading/history?limit=20",
               {
                  credentials: "include",
               }
            );

            if (
               portfolioResponse.ok &&
               positionsResponse.ok &&
               tradesResponse.ok
            ) {
               const portfolioData = await portfolioResponse.json();
               const positionsData = await positionsResponse.json();
               const tradesData = await tradesResponse.json();

               // Calculate Bitcoin position from positions
               const btcPosition = positionsData.positions.find(
                  (p) => p.symbol === "BTCUSDT"
               );
               const position = btcPosition ? btcPosition.quantity : 0;

               update((store) => ({
                  ...store,
                  balance: portfolioData.balance,
                  position: position,
                  totalValue: portfolioData.totalValue,
                  trades: tradesData.trades || [],
               }));
            } else {
               console.error("Failed to fetch portfolio data");
            }
         } catch (error) {
            console.error("Portfolio refresh error:", error);
         }
      },

      // Update balance after a trade
      updateBalance(newBalance) {
         update((store) => ({
            ...store,
            balance: newBalance,
         }));
      },

      // Update Bitcoin position
      updatePosition(newPosition) {
         update((store) => ({
            ...store,
            position: newPosition,
         }));
      },

      // Add a new trade to history
      addTrade(trade) {
         update((store) => ({
            ...store,
            trades: [trade, ...store.trades], // Add to beginning of array
         }));
      },

      // Calculate total portfolio value including positions
      updateTotalValue(bitcoinPrice) {
         update((store) => ({
            ...store,
            totalValue: store.balance + store.position * bitcoinPrice,
         }));
      },

      // Reset portfolio to initial state
      reset() {
         set({
            balance: 100000,
            position: 0,
            totalValue: 100000,
            trades: [],
         });
      },
   };
}

// Export the store
export const portfolioStore = createPortfolioStore();
