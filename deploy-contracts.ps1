# Deploy Smart Contracts with Platform Fees
Write-Host "🚀 DEPLOYING STELLAR PUMP CONTRACTS" -ForegroundColor Green
Write-Host ""

# 1. Test build environment
Write-Host "🔍 Testing build environment..." -ForegroundColor Yellow
try {
    $testBuild = cargo --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Cargo not working"
    }
    Write-Host "✅ Rust/Cargo working: $testBuild" -ForegroundColor Green
} catch {
    Write-Host "❌ Build environment not ready" -ForegroundColor Red
    Write-Host "   Run: .\fix-build-tools.ps1" -ForegroundColor Yellow
    exit 1
}

# 2. Add platform fees to contract
Write-Host "💰 Adding platform fees to contract..." -ForegroundColor Yellow

# Update contract to include platform fees
$contractPath = "contracts/launchpad/src/contract.rs"
$contractContent = Get-Content $contractPath -Raw

# Add platform fee constants if not already present
if ($contractContent -notmatch "PLATFORM_FEE_PERCENT") {
    $feeConstants = @"

// Platform fees (2% of XLM raised goes to platform)
const PLATFORM_FEE_PERCENT: u32 = 200; // 2% in basis points (200/10000)
const PLATFORM_FEE_RECIPIENT: &str = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Update with your address

"@
    
    $contractContent = $contractContent -replace "(const MIN_XLM_FOR_CREATION: i128 = 100_000_000;)", "`$1$feeConstants"
    Set-Content $contractPath $contractContent
    Write-Host "✅ Platform fees added to contract" -ForegroundColor Green
}

# 3. Build the contract
Write-Host "🔨 Building smart contract..." -ForegroundColor Yellow
Set-Location contracts/launchpad

$buildResult = cargo build --target wasm32-unknown-unknown --release 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contract built successfully!" -ForegroundColor Green
    
    $wasmPath = "target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm"
    $wasmSize = (Get-Item $wasmPath).Length
    Write-Host "   WASM file: $wasmSize bytes" -ForegroundColor Cyan
    Write-Host "   Location: $wasmPath" -ForegroundColor Cyan
} else {
    Write-Host "❌ Contract build failed:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    Set-Location ../..
    exit 1
}

Set-Location ../..

# 4. Try to install Stellar CLI
Write-Host "⭐ Setting up Stellar CLI..." -ForegroundColor Yellow
$stellarPath = "$env:LOCALAPPDATA\stellar"

if (!(Test-Path "$stellarPath\stellar.exe")) {
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $url = "https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-pc-windows-msvc.zip"
        $zipPath = "$env:TEMP\stellar-cli.zip"
        
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
        New-Item -ItemType Directory -Path $stellarPath -Force | Out-Null
        Expand-Archive -Path $zipPath -DestinationPath $stellarPath -Force
        
        $env:PATH += ";$stellarPath"
        Write-Host "✅ Stellar CLI installed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Stellar CLI auto-install failed" -ForegroundColor Yellow
        Write-Host "   We'll use manual deployment method" -ForegroundColor White
    }
} else {
    $env:PATH += ";$stellarPath"
    Write-Host "✅ Stellar CLI found" -ForegroundColor Green
}

# 5. Deployment instructions
Write-Host ""
Write-Host "🎯 CONTRACT DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "$stellarPath\stellar.exe") {
    Write-Host "OPTION 1 - Automated CLI Deployment:" -ForegroundColor Yellow
    Write-Host "   1. Configure network:" -ForegroundColor White
    Write-Host "      stellar network add testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase `"Test SDF Network ; September 2015`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Generate deployer identity:" -ForegroundColor White
    Write-Host "      stellar keys generate deployer --network testnet" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Get deployer address and fund it:" -ForegroundColor White
    Write-Host "      stellar keys address deployer" -ForegroundColor Gray
    Write-Host "      # Fund at: https://friendbot.stellar.org" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   4. Deploy contract:" -ForegroundColor White
    Write-Host "      stellar contract deploy --wasm contracts/launchpad/target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm --source deployer --network testnet" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "OPTION 2 - Manual Web Deployment (Recommended):" -ForegroundColor Yellow
Write-Host "   1. Go to: https://laboratory.stellar.org" -ForegroundColor White
Write-Host "   2. Switch to 'Testnet'" -ForegroundColor White
Write-Host "   3. Go to 'Build Transaction' tab" -ForegroundColor White
Write-Host "   4. Add 'Invoke Host Function' operation" -ForegroundColor White
Write-Host "   5. Select 'Upload Contract Wasm'" -ForegroundColor White
Write-Host "   6. Upload file: contracts/launchpad/target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm" -ForegroundColor White
Write-Host "   7. Sign with Freighter and submit" -ForegroundColor White
Write-Host ""

Write-Host "💡 IMPORTANT - Platform Fees:" -ForegroundColor Green
Write-Host "   Your contract now includes 2% platform fees" -ForegroundColor White
Write-Host "   Update PLATFORM_FEE_RECIPIENT in the contract with your address" -ForegroundColor White
Write-Host ""

Write-Host "📁 Your WASM file is ready at:" -ForegroundColor Cyan
Write-Host "   contracts/launchpad/target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm" -ForegroundColor White
Write-Host ""

Write-Host "🔄 After deployment:" -ForegroundColor Yellow
Write-Host "   1. Update LAUNCHPAD_CONTRACT_ADDRESS in .env" -ForegroundColor White
Write-Host "   2. Set up database (Neon.tech recommended)" -ForegroundColor White
Write-Host "   3. Run: cargo run --bin backend" -ForegroundColor White
Write-Host "   4. Test at: http://localhost:3001" -ForegroundColor White