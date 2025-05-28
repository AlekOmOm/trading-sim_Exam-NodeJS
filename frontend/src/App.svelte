<!-- Main App Component -->
<script>
  import { onMount, onDestroy } from 'svelte';

  import Header from './lib/components/layout/Header.svelte';
  import TradingDashboard from './lib/components/TradingDashboard.svelte';
  import LandingPage from './lib/components/LandingPage.svelte';
  
  // Import new auth service and stores
  import authService from './lib/services/authService';
  import { user, isLoadingAuth, authError } from './lib/stores/authStore';

  // Import router
  import { currentRoute, initRouter, ROUTES } from './lib/stores/routerStore';

  // Import WebSocket service (keeping existing functionality)
  import { websocketService } from './services/websocket.js'; // Assuming this path is correct relative to App.svelte

  let authCheckInterval;

  // Event handlers for auth re-checking
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      authService.checkAuth();
    }
  };
  
  const handleFocus = () => {
    authService.checkAuth();
  };

  onMount(async () => {
    // Initialize router
    initRouter();
    
    // Re-enabled authentication
    await authService.refreshAuthState();
    
    // Set up periodic auth check (every 30 seconds)
    authCheckInterval = setInterval(() => authService.checkAuth(), 30000);
    
    // Check auth when page becomes visible (handles return from auth system)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check auth when window gains focus (alternative method)
    window.addEventListener('focus', handleFocus);
  });
  
  onDestroy(() => {
    websocketService.disconnect();
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
  });
  
  // Connect to WebSocket when user logs in (adapting to new user store)
  $: if ($user) { // Check if user object exists
    websocketService.connect();
  }
</script>

<!-- Simple app layout -->
{#if $currentRoute === ROUTES.HOME}
  <!-- Landing page - no header, full page experience -->
  <LandingPage />
{:else}
  <!-- Main app with header -->
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Top navigation bar -->
    <Header />
    
    <!-- Main content area -->
    <main class="container mx-auto px-4 py-6">
      {#if $isLoadingAuth}
        <!-- Show loading while checking auth -->
        <div class="flex justify-center items-center h-64">
          <div class="text-xl text-gray-400">Loading Authentication...</div>
        </div>
      {:else if $user}
        <!-- Show trading dashboard if logged in -->
        <TradingDashboard />
      {:else}
        <!-- Show login message if not authenticated -->
        <div class="flex justify-center items-center h-64">
          <div class="text-center">
            <h2 class="text-2xl mb-4">Welcome to Trading Simulator</h2>
            {#if $authError}
              <p class="text-red-400 mb-4">Authentication Error: {$authError}</p>
              <p class="text-sm text-gray-500 mb-4">
                Please check that the auth-system is running and try again.
              </p>
            {/if}
            <p class="text-gray-400 mb-4">Please log in to start trading</p>
            <button 
              class="btn btn-primary bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              on:click={() => authService.redirectToLogin()}
            >
              Login
            </button>
          </div>
        </div>
      {/if}
    </main>
  </div>
{/if}

<style lang="css">
  /* Add any custom styles here */
</style>
