# 🚀 Complete Stellar Pump Setup Guide

Follow these steps in order to get your Stellar Pump launchpad working on testnet.

## Step 1: Start Docker Services

```powershell
# Start Docker Desktop first (from Start Menu)
# Then run:
docker-compose up -d postgres redis
```

## Step 2: Set Up Freighter Wallet

1. **Switch to Testnet**:
   - Open Freighter extension
   - Click Settings → Network → "Testnet"

2. **Get Test XLM**:
   - Copy your wallet address
   - Go to: https://friendbot.stellar.org
   - Paste your address and click "Get test network lumens"

## Step 3: Install Stellar CLI

```powershell
# Download and install Stellar CLI
$url = "https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-pc-windows-msvc.zip"
Invoke-WebRequest -Uri $url -OutFile "stellar-cli.zip"
Expand-Archive -Path "stellar-cli.zip" -DestinationPath "$env:LOCALAPPDATA\stellar" -Force

# Add to PATH (restart terminal after this)
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$env:LOCALAPPDATA\stellar*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$env:LOCALAPPDATA\stellar", "User")
}

# Verify installation (restart terminal first)
stellar --version
```

## Step 4: Build and Deploy Smart Contract

```powershell
# Build the contract
cd contracts/launchpad
cargo build --target wasm32-unknown-unknown --release

# Configure Stellar CLI for testnet
stellar network add testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015"

# Generate deployer identity
stellar keys generate deployer --network testnet

# Get the public key and fund it
$publicKey = stellar keys address deployer
Write-Host "Fund this address: $publicKey"
Write-Host "Go to: https://friendbot.stellar.org/?addr=$publicKey"
# Wait for funding, then continue...

# Deploy the contract
$contractId = stellar contract deploy --wasm target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm --source deployer --network testnet

Write-Host "Contract deployed! ID: $contractId"
```

## Step 5: Update Configuration

```powershell
# Update .env file with contract address
cd ../..
Copy-Item .env.example .env

# Edit .env file and add your contract ID:
# LAUNCHPAD_CONTRACT_ADDRESS=YOUR_CONTRACT_ID_HERE
```

## Step 6: Run Database Migrations

```powershell
# Run migrations
cargo run --bin migrate
```

## Step 7: Start Backend Services

```powershell
# Start the backend
cargo run --bin backend
```

## Step 8: Test the Frontend

Your frontend should already be running at `http://localhost:3000`

1. **Connect Wallet**: Click "Freighter" button
2. **Create Token**: Go to "Create Token" page
3. **Fill Form**: Enter token details
4. **Deploy**: Click "Create Token"

## 🎯 Expected Results

After completing all steps:

- ✅ Frontend running at `http://localhost:3000`
- ✅ Backend API running at `http://localhost:3001`
- ✅ Smart contract deployed on Stellar testnet
- ✅ Database with token tracking
- ✅ Freighter wallet connected

## 🔧 Troubleshooting

### Docker Issues
```powershell
# If Docker fails to start
# 1. Open Docker Desktop from Start Menu
# 2. Wait for it to fully start (whale icon should be steady)
# 3. Then run docker-compose commands
```

### Stellar CLI Issues
```powershell
# If stellar command not found
# 1. Restart your terminal
# 2. Check PATH: echo $env:PATH
# 3. Manually add if needed
```

### Contract Deployment Issues
```powershell
# If deployment fails
# 1. Make sure you have testnet XLM
# 2. Check network configuration
# 3. Verify contract built successfully
```

### Frontend Connection Issues
```powershell
# If Freighter not detected
# 1. Make sure extension is enabled
# 2. Switch to testnet in Freighter
# 3. Refresh the page
```

## 🎉 Success Indicators

You'll know everything is working when:

1. **Debug panel shows**: ✅ Detected, ✅ Connected, ✅ Allowed
2. **Token creation works**: Form submits without errors
3. **Backend logs show**: Contract events being indexed
4. **Database has data**: Token records are created

## 📞 Next Steps After Setup

Once everything is running:

1. **Create a test token** with small amounts
2. **Test the purchase flow** 
3. **Verify launch mechanics** work
4. **Check DEX integration** 
5. **Deploy to mainnet** when ready

---

**Need Help?** Check the console logs in both frontend (F12) and backend terminal for specific error messages.