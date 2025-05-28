<!-- Simple Portfolio Component -->
<script>
  import { portfolioStore } from '../../stores/portfolioStore.js'
  import { marketStore } from '../../stores/marketStore.js'
  import { onMount } from 'svelte'
  
  // Update total value when Bitcoin price changes
  $: if ($marketStore.currentPrice > 0) {
    portfolioStore.updateTotalValue($marketStore.currentPrice)
  }
  
  // Load portfolio data when component mounts
  onMount(() => {
    portfolioStore.refresh()
  })
  
  // Helper function to format currency
  function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }
  
  // Calculate profit/loss
  $: profitLoss = $portfolioStore.totalValue - 100000
  $: isProfit = profitLoss >= 0
</script>

<div class="card">
  <h3 class="text-xl font-bold text-white mb-4">Portfolio</h3>
  
  <!-- Portfolio summary -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    
    <!-- Cash Balance -->
    <div class="bg-gray-700 rounded p-4">
      <p class="text-gray-400 text-sm">Cash Balance</p>
      <p class="text-white text-lg font-bold">
        {formatCurrency($portfolioStore.balance)}
      </p>
    </div>
    
    <!-- Bitcoin Position -->
    <div class="bg-gray-700 rounded p-4">
      <p class="text-gray-400 text-sm">Bitcoin Position</p>
      <p class="text-white text-lg font-bold">
        {$portfolioStore.position.toFixed(8)} BTC
      </p>
    </div>
    
    <!-- Total Value -->
    <div class="bg-gray-700 rounded p-4">
      <p class="text-gray-400 text-sm">Total Value</p>
      <p class="text-white text-lg font-bold">
        {formatCurrency($portfolioStore.totalValue)}
      </p>
    </div>
    
    <!-- Profit/Loss -->
    <div class="bg-gray-700 rounded p-4">
      <p class="text-gray-400 text-sm">P&L</p>
      <p class="text-lg font-bold {isProfit ? 'text-profit' : 'text-loss'}">
        {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
      </p>
    </div>
    
  </div>
  
  <!-- Recent trades -->
  {#if $portfolioStore.trades.length > 0}
    <div>
      <h4 class="text-lg font-bold text-white mb-3">Recent Trades</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        {#each $portfolioStore.trades.slice(0, 5) as trade}
          <div class="flex justify-between items-center bg-gray-700 rounded p-3">
            <div>
              <span class="text-white font-medium">{trade.symbol}</span>
              <span class="text-{trade.side === 'BUY' ? 'profit' : 'loss'} ml-2">
                {trade.side}
              </span>
            </div>
            <div class="text-right">
              <p class="text-white">{trade.quantity} @ {formatCurrency(trade.price)}</p>
              <p class="text-gray-400 text-sm">
                {new Date(trade.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="text-center text-gray-400 py-8">
      <p>No trades yet. Start trading to see your activity here!</p>
    </div>
  {/if}
  
</div> 