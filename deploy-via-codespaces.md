# 🚀 Deploy via GitHub Codespaces (Fastest Method)

## Why This Works
- ✅ No Windows build tool issues
- ✅ Linux environment with everything pre-installed
- ✅ Deploy in 10 minutes
- ✅ Free GitHub Codespaces

## Step-by-Step Deployment

### 1. Push Your Code to GitHub
```bash
# Initialize git repo
git init
git add .
git commit -m "Stellar Pump Launchpad - Ready for deployment"

# Create GitHub repo and push
# Go to github.com, create new repo, then:
git remote add origin https://github.com/YOUR_USERNAME/stellar-pump-launchpad.git
git branch -M main
git push -u origin main
```

### 2. Open in GitHub Codespaces
1. Go to your GitHub repo
2. Click **"Code"** → **"Codespaces"** → **"Create codespace on main"**
3. Wait for environment to load (2-3 minutes)

### 3. Deploy from Codespaces
```bash
# Install Stellar CLI
curl -L https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-unknown-linux-gnu.tar.gz | tar -xz
sudo mv stellar /usr/local/bin/

# Add WASM target
rustup target add wasm32-unknown-unknown

# Build contract
cd contracts/launchpad
cargo build --target wasm32-unknown-unknown --release

# Configure Stellar CLI
stellar network add testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015"

# Generate deployer identity
stellar keys generate deployer --network testnet

# Get public key and fund it
stellar keys address deployer
# Fund at: https://friendbot.stellar.org

# Deploy contract
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm --source deployer --network testnet
```

### 4. Update Your Local Environment
Copy the contract ID back to your local .env file:
```
LAUNCHPAD_CONTRACT_ADDRESS=YOUR_CONTRACT_ID_HERE
```

## ⏱️ Timeline: 10 Minutes Total
- 3 minutes: Push to GitHub
- 2 minutes: Start Codespace
- 5 minutes: Build and deploy

## 🎯 Result
- ✅ Smart contract deployed to Stellar testnet
- ✅ Platform fees included (2% revenue)
- ✅ All rug-pull protections active
- ✅ Ready for real token creation and trading