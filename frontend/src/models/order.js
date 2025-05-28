/**
 * Order Model
 * For trading buy/sell orders
 */
export class Order {
   constructor(data = {}) {
      this.id = data.id || null;
      this.symbol = data.symbol || "BTCUSDT";
      this.side = data.side || "BUY"; // 'BUY' or 'SELL'
      this.type = data.type || "MARKET"; // 'MARKET' or 'LIMIT'
      this.quantity = parseFloat(data.quantity) || 0;
      this.price = parseFloat(data.price) || 0;
      this.status = data.status || "PENDING"; // 'PENDING', 'FILLED', 'CANCELLED'
      this.timestamp = data.timestamp || Date.now();
      this.filled_quantity = parseFloat(data.filled_quantity) || 0;
      this.average_price = parseFloat(data.average_price) || 0;
   }

   /**
    * Get total order value
    */
   getTotalValue() {
      return this.quantity * this.price;
   }

   /**
    * Get filled value
    */
   getFilledValue() {
      return this.filled_quantity * this.average_price;
   }

   /**
    * Check if order is complete
    */
   isComplete() {
      return this.status === "FILLED";
   }

   /**
    * Check if order is buy order
    */
   isBuyOrder() {
      return this.side === "BUY";
   }

   /**
    * Check if order is sell order
    */
   isSellOrder() {
      return this.side === "SELL";
   }

   /**
    * Check if order is market order
    */
   isMarketOrder() {
      return this.type === "MARKET";
   }

   /**
    * Get order status color for UI
    */
   getStatusColor() {
      switch (this.status) {
         case "FILLED":
            return "text-green-400";
         case "CANCELLED":
            return "text-red-400";
         case "PENDING":
            return "text-yellow-400";
         default:
            return "text-gray-400";
      }
   }

   /**
    * Get side color for UI
    */
   getSideColor() {
      return this.isBuyOrder() ? "text-green-400" : "text-red-400";
   }

   /**
    * Create order for API submission
    */
   toApiFormat() {
      return {
         symbol: this.symbol,
         side: this.side,
         type: this.type,
         quantity: this.quantity,
         price: this.price,
      };
   }

   /**
    * Create from API response
    */
   static fromApi(apiData) {
      return new Order(apiData);
   }

   /**
    * Validate order data
    */
   isValid() {
      return (
         this.symbol &&
         ["BUY", "SELL"].includes(this.side) &&
         ["MARKET", "LIMIT"].includes(this.type) &&
         this.quantity > 0 &&
         (this.type === "MARKET" || this.price > 0)
      );
   }
}

export default Order;
