/**
 * Trade Model
 * Represents an executed trade
 */

const COMMISSION_ASSET = "USDT"; // the trading pair's quote asset
const COMMISSION_PERCENTAGE = 0.0005; // 0.05%
const SYMBOL = "BTCUSDT"; // the trading pair - fixed 

export class Trade {
   constructor(data = {}) {
      this.id = data.id || null; // Trade ID from backend
      this.order_id = data.order_id || null; // Corresponding order ID
      this.symbol = data.symbol || SYMBOL;
      this.side = data.side || "BUY"; // 'BUY' or 'SELL'
      this.quantity = parseFloat(data.quantity) || 0; // Executed quantity
      this.price = parseFloat(data.price) || 0; // Execution price
      this.timestamp = data.timestamp || Date.now(); // Execution timestamp
      this.commission = COMMISSION_PERCENTAGE * this.getTotalValue(); // Trading commission
      this.commission_asset = COMMISSION_ASSET; // Asset for commission
   }

   /**
    * Get total value of the trade (quantity * price)
    */
   getTotalValue() {
      return this.quantity * this.price;
   }

   /**
    * Get net value of the trade
    * - (total value - commission)
    *
    */
   getNetValue() {
      // Assuming commission is in the same currency as price for simplicity
      // This might need more sophisticated logic if commission_asset is different (e.g. BTC)
      if (
         this.commission_asset.toUpperCase() ===
            this.symbol.replace("USDT", "").toUpperCase() ||
         this.commission_asset === "USD"
      ) {
         return this.side === "BUY"
            ? this.getTotalValue() + this.commission
            : this.getTotalValue() - this.commission;
      }
      return this.getTotalValue(); // Or handle conversion if necessary
   }

   /**
    * Check if it's a buy trade
    */
   isBuy() {
      return this.side === "BUY";
   }

   /**
    * Check if it's a sell trade
    */
   isSell() {
      return this.side === "SELL";
   }

   /**
    * Create Trade from API response or WebSocket message
    */
   static fromRawData(rawData) {
      return new Trade(rawData);
   }

   /**
    * Validate trade data
    */
   isValid() {
      return (
         this.id &&
         this.order_id &&
         this.symbol &&
         ["BUY", "SELL"].includes(this.side) &&
         this.quantity > 0 &&
         this.price > 0 &&
         this.timestamp > 0
      );
   }
}

export default Trade;
