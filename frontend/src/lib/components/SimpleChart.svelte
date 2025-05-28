<!-- Simple Chart Component -->
<script>
  import { onMount } from 'svelte'
  import { marketStore } from '../../stores/marketStore.js'
  
  let chartContainer
  let chart = null
  let priceHistory = [] // Store price history for the chart
  
  // Add new price to history when market updates
  $: if ($marketStore.currentPrice > 0) {
    addPriceToHistory($marketStore.currentPrice)
  }
  
  onMount(() => {
    setupChart()
    
    // Cleanup when component is destroyed
    return () => {
      if (chart) {
        chart.destroy()
      }
    }
  })
  
  async function setupChart() {
    try {
      // Import Chart.js (this keeps the bundle smaller)
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      
      // Create the chart
      const ctx = chartContainer.getContext('2d')
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [], // Time labels
          datasets: [{
            label: 'BTCUSDT Price',
            data: [], // Price data
            borderColor: '#10b981', // Green line
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Bitcoin Price Chart',
              color: '#ffffff'
            },
            legend: {
              labels: {
                color: '#ffffff'
              }
            }
          },
          scales: {
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#374151' }
            },
            y: {
              ticks: { 
                color: '#9ca3af',
                callback: function(value) {
                  return '$' + value.toLocaleString()
                }
              },
              grid: { color: '#374151' }
            }
          }
        }
      })
    } catch (error) {
      console.error('Failed to setup chart:', error)
    }
  }
  
  function addPriceToHistory(price) {
    const now = new Date().toLocaleTimeString()
    
    // Add new price point
    priceHistory = [...priceHistory, { time: now, price: price }]
    
    // Keep only last 20 points for simplicity
    if (priceHistory.length > 20) {
      priceHistory = priceHistory.slice(-20)
    }
    
    // Update chart if it exists
    if (chart) {
      chart.data.labels = priceHistory.map(p => p.time)
      chart.data.datasets[0].data = priceHistory.map(p => p.price)
      chart.update('none') // No animation for real-time updates
    }
  }
</script>

<div class="card">
  <div class="h-96">
    {#if chartContainer}
      <!-- Chart will be rendered here -->
    {/if}
    <canvas bind:this={chartContainer}></canvas>
  </div>
  
  <!-- Simple chart info -->
  <div class="mt-4 text-center text-gray-400 text-sm">
    Real-time Bitcoin price updates • {priceHistory.length} data points
  </div>
</div> 