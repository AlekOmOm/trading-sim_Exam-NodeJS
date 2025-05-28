<!-- Simple Trading Panel -->
<script>
  import { marketStore } from '../../stores/marketStore.js'
  import { portfolioStore } from '../../stores/portfolioStore.js'
  
  let quantity = 1
  let isPlacingOrder = false
  let orderMessage = ''
  
  // Calculate total cost of the order
  $: totalCost = quantity * $marketStore.currentPrice
  $: canAffordBuy = $portfolioStore.balance >= totalCost
  $: hasPositionToSell = $portfolioStore.position > 0
  
  async function placeBuyOrder() {
    if (isPlacingOrder || !canAffordBuy) return
    
    isPlacingOrder = true
    orderMessage = 'Placing buy order...'
    
    try {
      const response = await fetch('/api/trading/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          quantity: quantity,
          price: $marketStore.currentPrice
        })
      })
      
      if (response.ok) {
        orderMessage = '✅ Buy order successful!'
        portfolioStore.refresh() // Refresh portfolio data
        quantity = 1 // Reset quantity
        
        // Small delay to ensure backend has processed the trade
        setTimeout(() => {
          portfolioStore.refresh()
        }, 500)
      } else {
        orderMessage = '❌ Buy order failed'
      }
    } catch (error) {
      console.error('Buy order error:', error)
      orderMessage = '❌ Network error'
    }
    
    isPlacingOrder = false
    
    // Clear message after 3 seconds
    setTimeout(() => {
      orderMessage = ''
    }, 3000)
  }
  
  async function placeSellOrder() {
    if (isPlacingOrder || !hasPositionToSell) return
    
    isPlacingOrder = true
    orderMessage = 'Placing sell order...'
    
    try {
      const response = await fetch('/api/trading/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          quantity: quantity,
          price: $marketStore.currentPrice
        })
      })
      
      if (response.ok) {
        orderMessage = '✅ Sell order successful!'
        portfolioStore.refresh() // Refresh portfolio data
        quantity = 1 // Reset quantity
        
        // Small delay to ensure backend has processed the trade
        setTimeout(() => {
          portfolioStore.refresh()
        }, 500)
      } else {
        orderMessage = '❌ Sell order failed'
      }
    } catch (error) {
      console.error('Sell order error:', error)
      orderMessage = '❌ Network error'
    }
    
    isPlacingOrder = false
    
    // Clear message after 3 seconds
    setTimeout(() => {
      orderMessage = ''
    }, 3000)
  }
</script>

<div class="card">
  <h3 class="text-xl font-bold text-white mb-4">Place Order</h3>
  
  <!-- Quantity input -->
  <div class="mb-4">
    <label for="quantity-input" class="block text-gray-300 text-sm mb-2">Quantity</label>
    <input 
      id="quantity-input"
      type="number" 
      bind:value={quantity}
      min="0.01"
      step="0.01"
      class="input w-full"
      placeholder="Enter quantity"
    />
  </div>
  
  <!-- Order summary -->
  <div class="bg-gray-700 rounded p-3 mb-4">
    <div class="flex justify-between text-sm mb-2">
      <span class="text-gray-300">Price:</span>
      <span class="text-white">${$marketStore.currentPrice?.toLocaleString() || '--'}</span>
    </div>
    <div class="flex justify-between text-sm mb-2">
      <span class="text-gray-300">Quantity:</span>
      <span class="text-white">{quantity}</span>
    </div>
    <div class="flex justify-between text-sm font-bold">
      <span class="text-gray-300">Total:</span>
      <span class="text-white">${totalCost?.toLocaleString() || '--'}</span>
    </div>
  </div>
  
  <!-- Buy/Sell buttons -->
  <div class="space-y-3">
    
    <!-- Buy button -->
    <button 
      class="btn btn-buy w-full"
      class:opacity-50={!canAffordBuy || isPlacingOrder}
      disabled={!canAffordBuy || isPlacingOrder}
      on:click={placeBuyOrder}
    >
      {isPlacingOrder ? 'Processing...' : 'Buy Bitcoin'}
    </button>
    
    {#if !canAffordBuy && $marketStore.currentPrice > 0}
      <p class="text-loss text-sm">Insufficient balance</p>
    {/if}
    
    <!-- Sell button -->
    <button 
      class="btn btn-sell w-full"
      class:opacity-50={!hasPositionToSell || isPlacingOrder}
      disabled={!hasPositionToSell || isPlacingOrder}
      on:click={placeSellOrder}
    >
      {isPlacingOrder ? 'Processing...' : 'Sell Bitcoin'}
    </button>
    
    {#if !hasPositionToSell}
      <p class="text-loss text-sm">No Bitcoin to sell</p>
    {/if}
    
  </div>
  
  <!-- Order message -->
  {#if orderMessage}
    <div class="mt-4 p-3 bg-gray-700 rounded text-center">
      <p class="text-white text-sm">{orderMessage}</p>
    </div>
  {/if}
  
</div> 