# Trading Simulator 

playground for testing Trading Strategies

- create account and login
- virtual portfolio with $100,000 starting balance
- buy and sell BTCUSDT 
- real-time candlestick charts
- portfolio tracking (balance, positions, P&L)
- trade history

more details:
- [MVP](docs/MVP.md)
- [TECH-STACK](docs/TECH.md)
- [INTEGRATIONS](docs/INTEGRATIONS.md)

docs:
- [frontend](frontend/README.md)
- [backend](backend/README.md)

## get started 

```bash
git clone https://github.com/AlekOmOm/trading-sim_Exam-NodeJS.git
cd trading-sim_Exam-NodeJS
make run

```


## 📁 File Structure

```
trading-sim_Exam-NodeJS/
   ├── .env.template          
   ├── .env                   # auto-generated (with `make run`)
   ├── shared/
   ├── backend/
   ├── frontend/
   ├── scripts/
   │   └── setup-env.js       
   ├── docs/
   ...
   └── README.md         
```

### 🛠️ Enhanced Makefile Commands

```bash
# main
make run                # Run both frontend and backend

# docker 
make restart
make build
make clean
make clean-full 

# env 
make setup-env          # Interactive environment configuration

# for local npm run
make install-deps       # Install all dependencies
make validate           # Validate entire project setup

# Help
make help              # Show all available commands
```

## 📚 Documentation

- [MVP.md](docs/MVP.md) - Project overview and user flows
- [API.md](docs/API.md) - API documentation
- [TECH.md](docs/TECH.md) - Technical documentation
