/**
 * Candle Model
 * Based on data-server integration spec
 */
export class Candle {
   constructor(data = {}) {
      this.timestamp = data.timestamp || Date.now();
      this.symbol = data.symbol || "BTCUSDT";
      this.interval = data.interval || "1m";
      this.open = parseFloat(data.open) || 0;
      this.high = parseFloat(data.high) || 0;
      this.low = parseFloat(data.low) || 0;
      this.close = parseFloat(data.close) || 0;
      this.volume = parseFloat(data.volume) || 0;
      this.is_closed = data.is_closed || false;
   }

   /**
    * Get price change from open to close
    */
   getPriceChange() {
      return this.close - this.open;
   }

   /**
    * Get percentage change from open to close
    */
   getPercentChange() {
      if (this.open === 0) return 0;
      return (this.getPriceChange() / this.open) * 100;
   }

   /**
    * Check if candle is bullish (green)
    */
   isBullish() {
      return this.close >= this.open;
   }

   /**
    * Get candle as Chart.js compatible format
    */
   toChartFormat() {
      return {
         x: new Date(this.timestamp),
         o: this.open,
         h: this.high,
         l: this.low,
         c: this.close,
      };
   }

   /**
    * Create from Socket.IO data
    */
   static fromSocket(socketData) {
      return new Candle(socketData);
   }

   /**
    * Validate candle data
    */
   isValid() {
      return (
         this.timestamp > 0 &&
         this.open >= 0 &&
         this.high >= 0 &&
         this.low >= 0 &&
         this.close >= 0 &&
         this.high >= this.low &&
         this.high >= Math.max(this.open, this.close) &&
         this.low <= Math.min(this.open, this.close)
      );
   }
}

export default Candle;
