# Get the compiled WASM file from the build
Write-Host "🔍 Looking for compiled WASM file..." -ForegroundColor Yellow

# Check if the file exists in the target directory
$wasmPath = "contracts/launchpad/target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm"

if (Test-Path $wasmPath) {
    Write-Host "✅ Found WASM file at: $wasmPath" -ForegroundColor Green
    
    # Copy to root directory for easy access
    Copy-Item $wasmPath "stellar_pump_launchpad.wasm"
    Write-Host "✅ Copied WASM file to root directory" -ForegroundColor Green
    
    # Show file info
    $fileInfo = Get-Item "stellar_pump_launchpad.wasm"
    Write-Host "📁 File Size: $($fileInfo.Length) bytes" -ForegroundColor Cyan
    Write-Host "📅 Created: $($fileInfo.CreationTime)" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "🚀 WASM file ready for deployment!" -ForegroundColor Green
    Write-Host "File: stellar_pump_launchpad.wasm" -ForegroundColor White
    
} else {
    Write-Host "❌ WASM file not found. Building contract..." -ForegroundColor Red
    
    # Try to build the contract
    Set-Location contracts/launchpad
    cargo build --target wasm32-unknown-unknown --release
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
        Set-Location ../..
        
        if (Test-Path $wasmPath) {
            Copy-Item $wasmPath "stellar_pump_launchpad.wasm"
            Write-Host "✅ WASM file copied to root directory" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        Set-Location ../..
    }
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy using: stellar contract deploy --wasm stellar_pump_launchpad.wasm --source deployer --network testnet" -ForegroundColor White
Write-Host "2. Update your .env file with the contract address" -ForegroundColor White
Write-Host "3. Test your launchpad!" -ForegroundColor White