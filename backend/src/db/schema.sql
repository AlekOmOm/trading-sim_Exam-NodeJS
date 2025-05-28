/**
 * Trading Simulator Database Schema
 * 
 * This file creates the necessary tables for the trading simulator.
 * Run this after setting up your PostgreSQL database and Auth-System.
 * 
 * To execute:
 * psql -h localhost -U postgres -d auth_system -f schema.sql
 */

-- Create our schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS trading_sim_schema;

-- Set the search path to use our schema
SET search_path TO trading_sim_schema;

-- =====================================================
-- PORTFOLIOS TABLE
-- Stores user portfolio information (balance, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE, -- References auth_internal.users(id)
    balance DECIMAL(15,2) DEFAULT 100000.00, -- Starting virtual money
    total_invested DECIMAL(15,2) DEFAULT 0.00, -- Total amount invested
    total_pnl DECIMAL(15,2) DEFAULT 0.00, -- Total profit/loss
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);

-- =====================================================
-- POSITIONS TABLE
-- Stores current stock positions for each user
-- =====================================================
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol VARCHAR(10) NOT NULL, -- Stock symbol (e.g., AAPL, GOOGL)
    quantity DECIMAL(15,8) NOT NULL, -- Number of shares owned
    avg_price DECIMAL(15,2) NOT NULL, -- Average purchase price
    current_price DECIMAL(15,2), -- Current market price
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure one position per symbol per user
    UNIQUE(user_id, symbol)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
CREATE INDEX IF NOT EXISTS idx_positions_user_symbol ON positions(user_id, symbol);

-- =====================================================
-- TRADES TABLE
-- Stores all trading history (buy/sell transactions)
-- =====================================================
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity DECIMAL(15,8) NOT NULL,
    price DECIMAL(15,2) NOT NULL, -- Price per share
    total DECIMAL(15,2) NOT NULL, -- Total transaction amount
    fee DECIMAL(15,2) DEFAULT 0.00, -- Transaction fee (for future use)
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_symbol ON trades(user_id, symbol);

-- =====================================================
-- MARKET_DATA TABLE (Optional)
-- Cache current market prices for better performance
-- =====================================================
CREATE TABLE IF NOT EXISTS market_data (
    symbol VARCHAR(10) PRIMARY KEY,
    current_price DECIMAL(15,2) NOT NULL,
    daily_change DECIMAL(15,2),
    daily_change_percent DECIMAL(5,2),
    volume DECIMAL(20,2),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Index for price lookups
CREATE INDEX IF NOT EXISTS idx_market_data_updated ON market_data(last_updated DESC);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert some sample market data
INSERT INTO market_data (symbol, current_price, daily_change, daily_change_percent, volume) 
VALUES 
    ('AAPL', 175.00, 2.50, 1.45, 50000000),
    ('GOOGL', 140.00, -1.20, -0.85, 30000000),
    ('MSFT', 380.00, 5.75, 1.54, 25000000),
    ('TSLA', 250.00, -8.30, -3.21, 45000000),
    ('AMZN', 145.00, 3.20, 2.26, 35000000),
    ('META', 320.00, 4.80, 1.52, 20000000),
    ('NVDA', 480.00, 12.50, 2.68, 60000000),
    ('NFLX', 450.00, -2.10, -0.46, 15000000)
ON CONFLICT (symbol) DO NOTHING;

-- =====================================================
-- USEFUL QUERIES FOR REFERENCE
-- =====================================================

/*
-- Get user's portfolio summary:
SELECT 
    p.balance,
    COUNT(pos.id) as positions_count,
    SUM(pos.quantity * pos.current_price) as total_position_value
FROM portfolios p
LEFT JOIN positions pos ON p.user_id = pos.user_id
WHERE p.user_id = 'USER_ID_HERE'
GROUP BY p.id, p.balance;

-- Get user's positions with P&L:
SELECT 
    pos.*,
    (pos.quantity * pos.current_price) as position_value,
    (pos.quantity * (pos.current_price - pos.avg_price)) as unrealized_pnl,
    ((pos.current_price - pos.avg_price) / pos.avg_price * 100) as pnl_percentage
FROM positions pos
WHERE pos.user_id = 'USER_ID_HERE';

-- Get trade history:
SELECT * FROM trades 
WHERE user_id = 'USER_ID_HERE' 
ORDER BY executed_at DESC 
LIMIT 50;

-- Get trading statistics:
SELECT 
    COUNT(*) as total_trades,
    COUNT(CASE WHEN side = 'BUY' THEN 1 END) as buy_trades,
    COUNT(CASE WHEN side = 'SELL' THEN 1 END) as sell_trades,
    SUM(total) as total_volume,
    AVG(total) as avg_trade_size
FROM trades 
WHERE user_id = 'USER_ID_HERE';
*/

-- =====================================================
-- PERMISSIONS (Adjust as needed)
-- =====================================================

-- Grant permissions to your application user
-- GRANT ALL PRIVILEGES ON SCHEMA trading_sim_schema TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA trading_sim_schema TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA trading_sim_schema TO your_app_user;

COMMENT ON SCHEMA trading_sim_schema IS 'Trading Simulator - Virtual stock trading platform';
COMMENT ON TABLE portfolios IS 'User portfolio balances and summary data';
COMMENT ON TABLE positions IS 'Current stock positions owned by users';
COMMENT ON TABLE trades IS 'Historical record of all buy/sell transactions';
COMMENT ON TABLE market_data IS 'Current market prices and daily statistics';

-- Reset search path
SET search_path TO public; 