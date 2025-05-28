<!-- Landing Page Component -->
<script>
  import authService from '../services/authService.js';
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
  <!-- Hero Section -->
  <div class="container mx-auto px-4 py-16">
    <div class="text-center mb-16">
      <h1 class="text-5xl font-bold text-white mb-6">
        📈 Trading Simulator
      </h1>
      <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        Master the art of cryptocurrency trading with real-time Bitcoin data in a risk-free environment. 
        Perfect your strategies before investing real money.
      </p>
      <div class="space-x-4">
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          on:click={() => authService.redirectToRegister()}
        >
          Get Started
        </button>
        <button 
          class="bg-transparent border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-bold py-2 px-8 rounded-lg text-lg transition-colors"
          on:click={() => authService.redirectToLogin()}
        >
          Sign In
        </button>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <!-- Real-time Data -->
      <div class="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <div class="text-3xl mb-4">📊</div>
        <h3 class="text-xl font-semibold text-white mb-3">Real-time Market Data</h3>
        <p class="text-gray-400">
          Trade with live Bitcoin prices streamed directly from market data feeds. 
          Experience authentic market conditions without the risk.
        </p>
      </div>

      <!-- Portfolio Management -->
      <div class="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <div class="text-3xl mb-4">💼</div>
        <h3 class="text-xl font-semibold text-white mb-3">Portfolio Tracking</h3>
        <p class="text-gray-400">
          Monitor your virtual portfolio with detailed P&L tracking, position management, 
          and comprehensive trading history.
        </p>
      </div>

      <!-- Risk-free Learning -->
      <div class="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <div class="text-3xl mb-4">🎯</div>
        <h3 class="text-xl font-semibold text-white mb-3">Risk-free Learning</h3>
        <p class="text-gray-400">
          Start with $100,000 virtual cash. Learn trading strategies, test your skills, 
          and build confidence before trading with real money.
        </p>
      </div>
    </div>

    <!-- Demo Section -->
    <div class="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">See It In Action</h2>
        <p class="text-gray-300 mb-6">
          Experience the full trading interface with real-time Bitcoin price updates
        </p>
      </div>

      <!-- Mock Trading Interface Preview -->
      <div class="bg-gray-900 rounded-lg p-6 border border-gray-600">
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Price Display -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-white">BTCUSDT</h3>
              <div class="text-right">
                <div class="text-2xl font-bold text-green-400">$107,164.80</div>
                <div class="text-sm text-green-400">+$32.90 (+0.03%)</div>
              </div>
            </div>
            <div class="text-sm text-gray-400">
              Status: <span class="text-green-400">Connected</span> • Live Data
            </div>
          </div>

          <!-- Portfolio Preview -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Portfolio</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-400">Cash Balance</div>
                <div class="text-white font-semibold">$100,000.00</div>
              </div>
              <div>
                <div class="text-gray-400">Bitcoin Position</div>
                <div class="text-white font-semibold">0.00000000 BTC</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="mt-6 text-center">
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
            on:click={() => authService.redirectToRegister()}
          >
            Start Trading Now
          </button>
        </div>
      </div>
    </div>

    <!-- Benefits Section -->
    <div class="mt-16 text-center">
      <h2 class="text-3xl font-bold text-white mb-8">Why Choose Trading Simulator?</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-2xl mb-2">🚀</div>
          <h4 class="font-semibold text-white mb-2">Instant Setup</h4>
          <p class="text-gray-400 text-sm">Get started in seconds with no downloads required</p>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-2">💡</div>
          <h4 class="font-semibold text-white mb-2">Learn by Doing</h4>
          <p class="text-gray-400 text-sm">Practice with real market conditions</p>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-2">🔒</div>
          <h4 class="font-semibold text-white mb-2">Secure & Safe</h4>
          <p class="text-gray-400 text-sm">No real money at risk, just learning</p>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-2">📱</div>
          <h4 class="font-semibold text-white mb-2">Always Available</h4>
          <p class="text-gray-400 text-sm">Trade 24/7 with live market data</p>
        </div>
      </div>
    </div>

    <!-- Footer CTA -->
    <div class="mt-16 text-center">
      <h2 class="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h2>
      <p class="text-gray-300 mb-6">Join thousands of traders learning with our simulator</p>
      <button 
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
        on:click={() => authService.redirectToRegister()}
      >
        Create Free Account
      </button>
    </div>
  </div>
</div>

<style>
  /* Add any additional custom styles here */
</style> 