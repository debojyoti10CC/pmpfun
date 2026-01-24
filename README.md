# Stellar Pump Launchpad

A fair-launch memecoin platform on the Stellar blockchain that replicates Pump.fun's behavior with trust-minimized, irreversible token launches.

## Features

- **Trust-minimized**: Mathematical impossibility of rug-pulls through immutable issuer accounts
- **Bonding Curves**: Deterministic on-chain pricing with monotonic price increases
- **Automatic DEX Launch**: Irreversible transition to Stellar DEX when conditions are met
- **Native Assets**: Uses Stellar's native asset system for maximum compatibility
- **Clean UX**: Hides blockchain complexity with automatic trustline management

## Architecture

- **Soroban Smart Contracts**: Core logic for token distribution and pricing
- **React Frontend**: Clean interface with wallet integration
- **Rust Backend**: Real-time indexing and analytics via Horizon API
- **PostgreSQL**: Token tracking and metrics storage

## Development Setup

### Prerequisites

- Rust 1.70+
- Node.js 18+
- Docker & Docker Compose
- Stellar CLI (for Soroban development)

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Start database services:
   ```bash
   docker-compose up -d postgres redis
   ```
4. Install dependencies:
   ```bash
   # Backend
   cargo build
   
   # Frontend
   cd frontend && npm install
   ```

### Running Locally

1. Start the backend indexer:
   ```bash
   cargo run --bin backend
   ```

2. Start the frontend:
   ```bash
   cd frontend && npm start
   ```

3. Deploy contracts to testnet:
   ```bash
   cd contracts/launchpad
   stellar contract deploy --wasm target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm --network testnet
   ```

## Manual Setup Requirements

The following items require manual configuration:

1. **Stellar CLI Installation**: Install from https://developers.stellar.org/docs/tools/developer-tools
2. **Wallet Setup**: Configure Freighter wallet for testnet
3. **Database Setup**: Run migrations after PostgreSQL is running
4. **Contract Deployment**: Deploy to testnet/mainnet and update contract addresses
5. **Domain & SSL**: Configure production domain and SSL certificates
6. **Monitoring**: Set up monitoring dashboards and alerting

## Security

This system provides mathematical guarantees against rug-pulls:
- Issuer accounts are permanently locked with AUTH_IMMUTABLE
- No admin withdrawal functions exist in contracts
- Launch transitions are irreversible
- All pricing logic is deterministic and on-chain

## License

MIT License# pmpfun
