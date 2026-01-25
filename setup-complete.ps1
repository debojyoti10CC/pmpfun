# Complete Stellar Pump Setup Script
# Run this as Administrator in PowerShell

param(
    [string]$FreighterSecretKey = ""
)

Write-Host "🚀 Setting up Stellar Pump Launchpad..." -ForegroundColor Green
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# 1. Check Docker
Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
if (Test-Command docker) {
    Write-Host "✅ Docker found" -ForegroundColor Green
    try {
        docker info | Out-Null
        Write-Host "✅ Docker is running" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        Write-Host "   1. Open Docker Desktop from Start Menu" -ForegroundColor White
        Write-Host "   2. Wait for it to start completely" -ForegroundColor White
        Write-Host "   3. Run this script again" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "❌ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# 2. Install Stellar CLI
Write-Host "⭐ Installing Stellar CLI..." -ForegroundColor Yellow
$stellarPath = "$env:LOCALAPPDATA\stellar"
if (!(Test-Path "$stellarPath\stellar.exe")) {
    $url = "https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-pc-windows-msvc.zip"
    $zipPath = "$env:TEMP\stellar-cli.zip"
    
    Write-Host "   Downloading Stellar CLI..." -ForegroundColor White
    try {
        # Use TLS 1.2 for GitHub downloads
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
        
        Write-Host "   Extracting..." -ForegroundColor White
        New-Item -ItemType Directory -Path $stellarPath -Force | Out-Null
        Expand-Archive -Path $zipPath -DestinationPath $stellarPath -Force
        
        # Add to PATH
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($currentPath -notlike "*$stellarPath*") {
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$stellarPath", "User")
            $env:PATH += ";$stellarPath"
        }
        
        Write-Host "✅ Stellar CLI installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download Stellar CLI: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Please download manually from: https://github.com/stellar/stellar-cli/releases" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Stellar CLI already installed" -ForegroundColor Green
}

# 3. Start Database Services
Write-Host "🗄️ Starting database services..." -ForegroundColor Yellow
try {
    docker-compose up -d postgres redis
    Write-Host "✅ Database services started" -ForegroundColor Green
    Start-Sleep 5
} catch {
    Write-Host "❌ Failed to start database services" -ForegroundColor Red
    exit 1
}

# 4. Build Contract
Write-Host "🔨 Building smart contract..." -ForegroundColor Yellow
Set-Location contracts/launchpad
$buildResult = cargo build --target wasm32-unknown-unknown --release
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contract built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Contract build failed" -ForegroundColor Red
    exit 1
}
Set-Location ../..

# 5. Configure Stellar Network
Write-Host "📡 Configuring Stellar testnet..." -ForegroundColor Yellow
& "$stellarPath\stellar.exe" network add testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015" 2>$null

# 6. Set up deployer identity
Write-Host "🔑 Setting up deployer identity..." -ForegroundColor Yellow
if ($FreighterSecretKey -ne "") {
    & "$stellarPath\stellar.exe" keys add deployer --secret-key $FreighterSecretKey --network testnet
    Write-Host "✅ Using provided secret key" -ForegroundColor Green
} else {
    & "$stellarPath\stellar.exe" keys generate deployer --network testnet
    $publicKey = & "$stellarPath\stellar.exe" keys address deployer
    
    Write-Host ""
    Write-Host "🎯 IMPORTANT: Fund your deployer account!" -ForegroundColor Cyan
    Write-Host "   Public Key: $publicKey" -ForegroundColor White
    Write-Host "   Go to: https://friendbot.stellar.org/?addr=$publicKey" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Enter after funding the account..." -ForegroundColor Yellow
    Read-Host
}

# 7. Deploy Contract
Write-Host "🚀 Deploying contract to testnet..." -ForegroundColor Yellow
$contractId = & "$stellarPath\stellar.exe" contract deploy --wasm contracts/launchpad/target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm --source deployer --network testnet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
    Write-Host "   Contract ID: $contractId" -ForegroundColor Cyan
    
    # 8. Update .env file
    Write-Host "📝 Updating configuration..." -ForegroundColor Yellow
    if (!(Test-Path .env)) {
        Copy-Item .env.example .env
    }
    
    $envContent = Get-Content .env
    $envContent = $envContent -replace "LAUNCHPAD_CONTRACT_ADDRESS=.*", "LAUNCHPAD_CONTRACT_ADDRESS=$contractId"
    $envContent | Set-Content .env
    
    Write-Host "✅ Configuration updated" -ForegroundColor Green
} else {
    Write-Host "❌ Contract deployment failed" -ForegroundColor Red
    exit 1
}

# 9. Run Database Migrations
Write-Host "🗃️ Running database migrations..." -ForegroundColor Yellow
$migrateResult = cargo run --bin migrate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "❌ Database migrations failed" -ForegroundColor Red
    exit 1
}

# 10. Final Instructions
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Database services running" -ForegroundColor White
Write-Host "   ✅ Smart contract deployed: $contractId" -ForegroundColor White
Write-Host "   ✅ Configuration updated" -ForegroundColor White
Write-Host "   ✅ Database migrations completed" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Start the backend:" -ForegroundColor White
Write-Host "      cargo run --bin backend" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Your frontend is already running at:" -ForegroundColor White
Write-Host "      http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. In Freighter wallet:" -ForegroundColor White
Write-Host "      - Switch to Testnet" -ForegroundColor Gray
Write-Host "      - Get test XLM from https://friendbot.stellar.org" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. Test the system:" -ForegroundColor White
Write-Host "      - Connect wallet on the frontend" -ForegroundColor Gray
Write-Host "      - Create a test token" -ForegroundColor Gray
Write-Host "      - Try purchasing tokens" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Your Stellar Pump launchpad is ready!" -ForegroundColor Green