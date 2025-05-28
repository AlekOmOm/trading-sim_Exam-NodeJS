// Simple market data store
import { writable } from "svelte/store";

// Create a store for market data
function createMarketStore() {
   const { subscribe, set, update } = writable({
      currentPrice: 0,
      openPrice: 0,
      highPrice: 0,
      lowPrice: 0,
      isConnected: false,
      lastUpdate: null,
   });

   return {
      subscribe,

      // Update price from real-time data
      updatePrice(newPrice) {
         update((store) => ({
            ...store,
            currentPrice: newPrice,
            lastUpdate: Date.now(),
         }));
      },

      // Update full candle data
      updateCandle(candleData) {
         update((store) => ({
            ...store,
            currentPrice: candleData.close,
            openPrice: candleData.open,
            highPrice: candleData.high,
            lowPrice: candleData.low,
            lastUpdate: Date.now(),
         }));
      },

      // Set connection status
      setConnected(connected) {
         update((store) => ({
            ...store,
            isConnected: connected,
         }));
      },

      // Reset all data
      reset() {
         set({
            currentPrice: 0,
            openPrice: 0,
            highPrice: 0,
            lowPrice: 0,
            isConnected: false,
            lastUpdate: null,
         });
      },
   };
}

// Export the store
export const marketStore = createMarketStore();
