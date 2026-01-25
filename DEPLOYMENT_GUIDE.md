# 🚀 Stellar Pump Launchpad - Deployment Guide

## 📋 Contract Information

**Contract Name**: `stellar-pump-launchpad`  
**Language**: Rust (Soroban)  
**Network**: Stellar Testnet/Mainnet  

## 🔧 Option 1: Deploy Using Stellar CLI (Recommended)

### Prerequisites
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools) installed
- Funded Stellar account

### Quick Deploy Commands

```bash
# 1. Configure network
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# 2. Generate or import keys
stellar keys generate deployer --network testnet
# OR import existing: stellar keys add deployer --secret-key YOUR_SECRET_KEY --network testnet

# 3. Fund account (get public key first)
stellar keys address deployer
# Fund at: https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY

# 4. Deploy contract (you'll need the compiled WASM file)
stellar contract deploy \
  --wasm stellar_pump_launchpad.wasm \
  --source deployer \
  --network testnet
```

## 🏗️ Option 2: Use Existing Deployment Services

### Stellar Expert
- Upload your contract to [Stellar Expert](https://stellar.expert/)
- Use their deployment interface

### StellarBurrito or other deployment services
- Many third-party services can deploy Soroban contracts

## 📁 Contract Source Files

The contract consists of these main files:

```
contracts/launchpad/src/
├── lib.rs              # Main entry point
├── contract.rs         # Core contract logic  
├── types.rs           # Data structures
├── errors.rs          # Error definitions
├── bonding_curve.rs   # Price calculation logic
├── asset_manager.rs   # Token management
└── storage.rs         # Data persistence
```

## 🔑 Key Contract Functions

### Core Functions
- `create_token()` - Create new token with bonding curve
- `buy_tokens()` - Purchase tokens with XLM
- `get_current_price()` - Get current token price
- `get_token_info()` - Get token details

### Features
- ✅ **Rug-pull Protection**: Issuer accounts locked permanently
- ✅ **Fair Launch**: Bonding curve price discovery
- ✅ **Auto DEX Launch**: Automatic transition to Stellar DEX
- ✅ **Mathematical Guarantees**: No admin functions

## 🌐 Contract Addresses (After Deployment)

Once deployed, update your `.env` file:

```env
# Testnet
LAUNCHPAD_CONTRACT_ADDRESS=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Mainnet (when ready)
LAUNCHPAD_CONTRACT_ADDRESS_MAINNET=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🔧 Integration with Frontend

The frontend is already configured to work with the deployed contract. After deployment:

1. Update the contract address in `.env`
2. Restart your frontend server
3. The UI will automatically connect to your deployed contract

## 📊 Contract Parameters

### Token Creation
- **Minimum Creation Fee**: 10 XLM (prevents spam)
- **Maximum Supply**: 922,337,203,685,477,580 (Stellar limit)
- **Symbol Length**: 1-12 characters
- **Launch Thresholds**: XLM amount OR percentage of supply

### Bonding Curves
- **Linear**: `price = base_price + (progress * multiplier)`
- **Quadratic**: `price = base_price + (progress² * multiplier)`

### Platform Fees
- **Creation Fee**: 10 XLM per token
- **Trading Fee**: 2% of all XLM transactions

## 🚨 Important Notes

1. **Irreversible**: Once deployed, contracts cannot be modified
2. **Testnet First**: Always test on testnet before mainnet
3. **Gas Fees**: Ensure sufficient XLM for deployment (~1-5 XLM)
4. **Backup Keys**: Securely store your deployment keys

## 🆘 Need Help?

If you need assistance with deployment:

1. **Stellar Discord**: Join the [Stellar Developer Discord](https://discord.gg/stellardev)
2. **Documentation**: [Soroban Docs](https://soroban.stellar.org/)
3. **Community**: [Stellar Stack Exchange](https://stellar.stackexchange.com/)

## 🎯 Next Steps After Deployment

1. ✅ Deploy contract to testnet
2. ✅ Update frontend configuration  
3. ✅ Test token creation and trading
4. ✅ Deploy to mainnet (when ready)
5. ✅ Launch your memecoin launchpad!

---

**Your neobrutalist Stellar Pump launchpad is ready to launch! 🚀**