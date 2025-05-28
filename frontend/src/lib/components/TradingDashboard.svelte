<!-- Simple Trading Dashboard -->
<script>
  import PriceDisplay from './PriceDisplay.svelte'
  import SimpleChart from './SimpleChart.svelte'
  import TradingPanel from './TradingPanel.svelte'
  import Portfolio from './Portfolio.svelte'
</script>

<div class="space-y-6">
  <!-- Page title -->
  <div class="text-center">
    <h2 class="text-3xl font-bold text-white mb-2">Trading Dashboard</h2>
    <p class="text-gray-400">Trade BTCUSDT with real-time data</p>
  </div>
  
  <!-- Price display at the top -->
  <PriceDisplay />
  
  <!-- Main trading area -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    <!-- Chart area (takes up 2/3 on large screens) -->
    <div class="lg:col-span-2">
      <SimpleChart />
    </div>
    
    <!-- Trading panel (takes up 1/3 on large screens) -->
    <div class="lg:col-span-1">
      <TradingPanel />
    </div>
    
  </div>
  
  <!-- Portfolio at the bottom -->
  <Portfolio />
  
</div> 