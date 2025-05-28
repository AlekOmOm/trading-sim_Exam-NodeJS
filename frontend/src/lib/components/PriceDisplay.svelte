<!-- Simple Price Display Component -->
<script>
  import { marketStore } from '../../stores/marketStore.js'
  
  // Format price to look nice
  function formatPrice(price) {
    if (!price) return '--'
    return '$' + price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }
  
  // Calculate if price went up or down
  $: priceChange = $marketStore.currentPrice - $marketStore.openPrice
  $: isPositive = priceChange >= 0
</script>

<div class="card">
  <div class="flex justify-between items-center">
    
    <!-- Symbol and name -->
    <div>
      <h3 class="text-2xl font-bold text-white">BTCUSDT</h3>
      <p class="text-gray-400">Bitcoin / Tether USD</p>
    </div>
    
    <!-- Current price and change -->
    <div class="text-right">
      <div class="text-3xl font-bold text-white">
        {formatPrice($marketStore.currentPrice)}
      </div>
      
      {#if priceChange !== 0}
        <div class="text-lg {isPositive ? 'text-profit' : 'text-loss'}">
          {isPositive ? '+' : ''}{formatPrice(Math.abs(priceChange))}
        </div>
      {/if}
    </div>
    
  </div>
  
  <!-- Market status -->
  <div class="mt-4 flex justify-between text-sm">
    <div>
      <span class="text-gray-400">Status: </span>
      <span class="{$marketStore.isConnected ? 'text-profit' : 'text-loss'}">
        {$marketStore.isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
    
    {#if $marketStore.lastUpdate}
      <div class="text-gray-400">
        Last update: {new Date($marketStore.lastUpdate).toLocaleTimeString()}
      </div>
    {/if}
  </div>
</div> 