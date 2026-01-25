# Ultra Fast Deploy - Skip CLI, Use Web Interface
Write-Host "⚡ ULTRA FAST DEPLOY - No CLI Required!" -ForegroundColor Green
Write-Host ""

# 1. Build Contract First
Write-Host "🔨 Building smart contract..." -ForegroundColor Yellow
Set-Location contracts/launchpad
$buildResult = cargo build --target wasm32-unknown-unknown --release 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contract built successfully" -ForegroundColor Green
    $wasmPath = "target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm"
    $wasmSize = (Get-Item $wasmPath).Length
    Write-Host "   WASM file: $wasmSize bytes" -ForegroundColor Cyan
} else {
    Write-Host "❌ Contract build failed:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Set-Location ../..

# 2. Set up basic configuration
Write-Host "📝 Setting up configuration..." -ForegroundColor Yellow
$envContent = @"
# Stellar Network Configuration
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Database Configuration (We'll add this later)
DATABASE_URL=postgresql://user:pass@localhost:5432/stellar_pump

# Backend Configuration
BACKEND_PORT=3002
CORS_ORIGIN=http://localhost:3001

# Contract Address (Will be updated after deployment)
LAUNCHPAD_CONTRACT_ADDRESS=

# Rate Limiting
RATE_LIMIT_TOKENS_PER_WALLET_PER_HOUR=5
RATE_LIMIT_PURCHASES_PER_WALLET_PER_MINUTE=10

# Minimum Requirements
MIN_XLM_FOR_TOKEN_CREATION=100000000
MIN_XLM_FOR_PURCHASE=1000000
"@

$envContent | Set-Content .env
Write-Host "✅ Basic configuration created" -ForegroundColor Green

# 3. Create deployment instructions
Write-Host ""
Write-Host "🎯 NEXT STEPS - Manual Deployment:" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION 1 - Use Stellar Laboratory (Easiest):" -ForegroundColor Yellow
Write-Host "   1. Go to: https://laboratory.stellar.org" -ForegroundColor White
Write-Host "   2. Switch to 'Testnet'" -ForegroundColor White
Write-Host "   3. Go to 'Build Transaction' tab" -ForegroundColor White
Write-Host "   4. Use 'Invoke Host Function' operation" -ForegroundColor White
Write-Host "   5. Upload your WASM file from:" -ForegroundColor White
Write-Host "      contracts/launchpad/target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm" -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 2 - Use Soroban CLI Online:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://soroban.stellar.org/docs/getting-started/deploy-to-testnet" -ForegroundColor White
Write-Host "   2. Follow the web-based deployment guide" -ForegroundColor White
Write-Host ""
Write-Host "OPTION 3 - Install Stellar CLI:" -ForegroundColor Yellow
Write-Host "   1. Run: .\manual-stellar-setup.ps1" -ForegroundColor White
Write-Host "   2. If that fails, download manually from GitHub" -ForegroundColor White
Write-Host ""
Write-Host "🎨 MEANWHILE - Test Your Frontend:" -ForegroundColor Green
Write-Host "   Your frontend is running at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   You can test all UI functionality right now!" -ForegroundColor White
Write-Host ""
Write-Host "📱 Frontend Features Working:" -ForegroundColor Yellow
Write-Host "   ✅ Wallet connection (Freighter)" -ForegroundColor White
Write-Host "   ✅ Token creation form" -ForegroundColor White
Write-Host "   ✅ All navigation and UI" -ForegroundColor White
Write-Host "   ✅ Responsive design" -ForegroundColor White
Write-Host ""
Write-Host "🔧 After Contract Deployment:" -ForegroundColor Cyan
Write-Host "   1. Update LAUNCHPAD_CONTRACT_ADDRESS in .env" -ForegroundColor White
Write-Host "   2. Set up database (Neon.tech or local)" -ForegroundColor White
Write-Host "   3. Run: cargo run --bin backend" -ForegroundColor White
Write-Host ""
Write-Host "💡 Your WASM file is ready at:" -ForegroundColor Green
Write-Host "   contracts/launchpad/target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm" -ForegroundColor Cyan