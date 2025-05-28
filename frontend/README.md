# Trading Simulator Frontend

A simple Svelte 5 frontend for the trading simulator project.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - Frontend: http://localhost:5173
   - Make sure backend is running on http://localhost:4000

## 📁 Project Structure

```
src/
├── components/simple/     # All UI components (easy to find!)
│   ├── Header.svelte     # Top navigation
│   ├── TradingDashboard.svelte  # Main dashboard
│   ├── PriceDisplay.svelte      # Bitcoin price display
│   ├── SimpleChart.svelte       # Price chart
│   ├── TradingPanel.svelte      # Buy/sell orders
│   └── Portfolio.svelte         # Balance & positions
├── stores/               # Data management (Svelte stores)
│   ├── authStore.js     # User login state
│   ├── marketStore.js   # Bitcoin price data
│   └── portfolioStore.js # User's money & trades
├── services/            # External connections
│   └── websocket.js     # Real-time price updates
├── utils/               # Helper functions
│   └── config.js        # App settings
├── App.svelte           # Main app component
└── main.js              # App entry point
```

## 🔧 Key Features

### ✅ Simple & Clean Code
- Easy-to-understand component names
- Clear folder structure
- Good comments for learning

### ✅ Real-time Trading
- Live Bitcoin price updates
- Buy/sell Bitcoin with fake money
- Portfolio tracking
- Trade history

### ✅ Modern Tech Stack
- **Svelte 5** - Modern reactive framework
- **Chart.js** - Beautiful price charts  
- **TailwindCSS** - Simple styling
- **Socket.IO** - Real-time data
- **Vite** - Fast development

## 🎯 How It Works

1. **Authentication**: Connects to Auth-System for login
2. **Real-time Data**: Gets Bitcoin prices via WebSocket
3. **Trading**: Place buy/sell orders through backend API
4. **Portfolio**: Track your fake money and Bitcoin

## 🔌 Backend Connection

The frontend connects to:
- **Backend API**: `http://localhost:4000` (trading & portfolio)
- **Auth System**: `http://localhost:3000` (login/logout)
- **WebSocket**: `candle-data.devalek.dev` (Bitcoin price updates)

## 📊 Components Explained

### Simple Components (for easy understanding)

1. **Header.svelte** - Top bar with login/logout
2. **TradingDashboard.svelte** - Main layout container
3. **PriceDisplay.svelte** - Shows current Bitcoin price
4. **SimpleChart.svelte** - Price history chart
5. **TradingPanel.svelte** - Buy/sell order form
6. **Portfolio.svelte** - Your money and positions

### Stores (data management)

1. **authStore.js** - Tracks if user is logged in
2. **marketStore.js** - Stores Bitcoin price data
3. **portfolioStore.js** - Your balance and trades

## 🛠️ Development

### Add New Features
1. Create new component in `src/components/simple/`
2. Add to the dashboard in `TradingDashboard.svelte`
3. Connect to stores for data

### Styling
- Uses TailwindCSS classes
- Dark theme by default
- Green for profits, red for losses
- Responsive design

## 📱 Responsive Design
- Works on mobile and desktop
- Trading panel stacks on mobile
- Chart adapts to screen size

## 🔄 Real-time Updates
- Bitcoin price updates every second
- Portfolio updates after trades
- Connection status indicator
- Automatic reconnection

---

**Perfect for learning:** Clean code, simple structure, good comments! 🎓
