# Start the complete Stellar Pump system
Write-Host "🚀 Starting Stellar Pump Launchpad System..." -ForegroundColor Green

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "❌ System not deployed yet. Run .\rapid-deploy.ps1 first" -ForegroundColor Red
    exit 1
}

# Check if contract is deployed
$envContent = Get-Content .env
$contractLine = $envContent | Where-Object { $_ -like "LAUNCHPAD_CONTRACT_ADDRESS=*" }
if (!$contractLine -or $contractLine -eq "LAUNCHPAD_CONTRACT_ADDRESS=") {
    Write-Host "❌ Contract not deployed. Run .\rapid-deploy.ps1 first" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuration found" -ForegroundColor Green

# Start backend in background
Write-Host "🔄 Starting backend API and indexer..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cargo run --bin backend" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep 3

# Check if frontend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend already running at http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "🎨 Starting frontend..." -ForegroundColor Yellow
    Set-Location frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Set-Location ..
}

Write-Host ""
Write-Host "🎉 Stellar Pump System Started!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Ready to test your launchpad!" -ForegroundColor Yellow