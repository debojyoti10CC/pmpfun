# Stellar Pump Launchpad Deployment Script for Testnet
param(
    [string]$SecretKey = ""
)

Write-Host "🚀 Deploying Stellar Pump Launchpad to Testnet..." -ForegroundColor Green

# Check if Stellar CLI is installed
try {
    stellar --version | Out-Null
} catch {
    Write-Host "❌ Stellar CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Configure network
Write-Host "📡 Configuring testnet..." -ForegroundColor Yellow
stellar network add testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015" 2>$null

# Set up identity
if ($SecretKey -ne "") {
    Write-Host "🔑 Using provided secret key..." -ForegroundColor Yellow
    stellar keys add deployer --secret-key $SecretKey --network testnet
} else {
    Write-Host "🔑 Generating new deployer identity..." -ForegroundColor Yellow
    stellar keys generate deployer --network testnet
    
    $publicKey = stellar keys address deployer
    Write-Host "📋 Deployer Public Key: $publicKey" -ForegroundColor Cyan
    Write-Host "💰 Fund this account at: https://friendbot.stellar.org/?addr=$publicKey" -ForegroundColor Cyan
    Write-Host "Press Enter after funding the account..." -ForegroundColor Yellow
    Read-Host
}

# Build contract
Write-Host "🔨 Building contract..." -ForegroundColor Yellow
Set-Location contracts/launchpad
cargo build --target wasm32-unknown-unknown --release

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Contract build failed!" -ForegroundColor Red
    exit 1
}

# Deploy contract
Write-Host "🚀 Deploying contract..." -ForegroundColor Yellow
$contractId = stellar contract deploy --wasm target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm --source deployer --network testnet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
    Write-Host "📋 Contract ID: $contractId" -ForegroundColor Cyan
    
    # Update .env file
    Set-Location ../..
    $envContent = Get-Content .env.example
    $envContent = $envContent -replace "LAUNCHPAD_CONTRACT_ADDRESS=", "LAUNCHPAD_CONTRACT_ADDRESS=$contractId"
    $envContent | Set-Content .env
    
    Write-Host "✅ Updated .env file with contract address" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "Contract ID: $contractId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start the backend: cargo run --bin backend" -ForegroundColor White
    Write-Host "2. The frontend is already running at http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "❌ Contract deployment failed!" -ForegroundColor Red
    exit 1
}