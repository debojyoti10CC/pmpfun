
#  Stellar Pump Launchpad

**The first fair-launch memecoin protocol on Stellar.** Stellar Pump replicates the high-velocity, trustless bonding curve model of Pump.fun, powered by **Soroban Smart Contracts**. It ensures 100% rug-proof launches through immutable issuer accounts and deterministic on-chain pricing.

##  The "Anti-Rug" Guarantee

Unlike traditional launches where developers retain control, Stellar Pump utilizes Stellar's native protocol features to ensure safety:

* **AUTH_IMMUTABLE:** Issuer accounts are permanently locked upon launch.
* **No Admin Backdoors:** Smart contracts contain zero withdrawal or "pause" functions for developer liquidity.
* **Atomic DEX Migration:** Once the bonding curve is hit, the transition to the Stellar Decentralized Exchange (DEX) is irreversible and automated.

---

##  Architecture Stack

| Component | Technology | Role |
| --- | --- | --- |
| **Smart Contracts** | Rust / Soroban | Core logic, bonding curves, and distribution |
| **Frontend** | React / Tailwind | User interface and Freighter wallet integration |
| **Backend** | Rust (Axum/Tokio) | Real-time indexing of Horizon API events |
| **Database** | PostgreSQL | Analytics, historical price tracking, and metadata |
| **Cache** | Redis | Fast retrieval of trending tokens and leaderboard |


---

##  Quick Start

### Prerequisites

* **Rust** (1.70+) & **Wasm** target
* **Node.js** (v18+)
* **Stellar CLI** ([Install Guide](https://developers.stellar.org/docs/tools/developer-tools))
* **Docker**

### 1. Clone & Environment

```bash
git clone https://github.com/your-repo/stellar-pump.git
cd stellar-pump
cp .env.example .env

```

### 2. Spin up Services

```bash
docker-compose up -d postgres redis

```

### 3. Deploy Smart Contracts

Ensure your Stellar CLI is configured for Testnet:

```bash
cd contracts/launchpad
cargo build --target wasm32-unknown-unknown --release

# Deploy to Testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm \
  --network testnet \
  --source-account <YOUR_ACCOUNT_ALIAS>

```

### 4. Launch Services

**Backend Indexer:**

```bash
cargo run --bin backend

```

**Frontend:**

```bash
cd frontend && npm install && npm start

```

---

## 🔧 Core Mechanics: The Bonding Curve

The price of each token follows a deterministic mathematical formula. As more tokens are purchased, the price increases along the curve:

Where  is the price and  is the circulating supply. Once the market cap reaches the threshold (e.g., 2000 XLM), the liquidity is automatically migrated to the Stellar DEX and the remaining LP tokens are burned.

---

## 🛠️ Manual Configuration Checklist

* [ ] **Contract ID:** Update `frontend/src/config.js` with your deployed Contract ID.
* [ ] **Network Passphrase:** Set to `Test SDF Network ; September 2015` for testnet.
* [ ] **Trustlines:** Ensure your frontend handles `ChangeTrust` operations for new assets automatically.
* [ ] **SSL:** Production deployments require SSL for Freighter wallet communication.

## 🔗 Resources

* **Live Contract Explorer:** [View on Stellar Lab](https://www.google.com/search?q=https://lab.stellar.org/smart-contracts/contract-explorer%3F%24%3Dnetwork%24id%3Dtestnet%26label%3DTestnet%26horizonUrl%3Dhttps:////horizon-testnet.stellar.org%26rpcUrl%3Dhttps:////soroban-testnet.stellar.org%26passphrase%3DTest%2520SDF%2520Network%2520/%3B%2520September%25202015%3B%26smartContracts%24explorer%24contractId%3DCDHPDLT7KVICFAGYUO4ICTC5TGGR2XN5ZYT56TWZMNM6ATFVKXKU57HI%3B%3B)
* **Soroban Docs:** [https://soroban.stellar.org/](https://soroban.stellar.org/)

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
