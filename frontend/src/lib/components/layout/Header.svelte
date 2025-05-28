<!-- Simple header component -->
<script>
  import { user } from '../../stores/authStore.js';
  import authService from '../../services/authService.js';
</script>

<header class="bg-gray-800 border-b border-gray-700">
  <div class="container mx-auto px-4 py-4">
    <div class="flex justify-between items-center">
      
      <!-- Logo and title -->
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-bold text-white">
          📈 Trading Simulator
        </h1>
      </div>
      
      <!-- User info and controls -->
      <div class="flex items-center space-x-4">
        {#if $user}
          <!-- Show user info when logged in -->
          <span class="text-gray-300">
            Welcome, {$user.name || $user.username || 'Trader'}
          </span>
          <button 
            class="btn bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
            on:click={() => authService.logout()}
          >
            Logout
          </button>
        {:else}
          <!-- Show login button when not logged in -->
          <button 
            class="btn btn-primary bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
            on:click={() => authService.redirectToLogin()}
          >
            Login
          </button>
        {/if}
      </div>
      
    </div>
  </div>
</header>