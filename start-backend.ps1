# Start Backend Services Script

Write-Host "🚀 Starting Stellar Pump Backend..." -ForegroundColor Green

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "❌ .env file not found. Please run setup-complete.ps1 first." -ForegroundColor Red
    exit 1
}

# Check if contract address is set
$envContent = Get-Content .env
$contractLine = $envContent | Where-Object { $_ -like "LAUNCHPAD_CONTRACT_ADDRESS=*" }
if (!$contractLine -or $contractLine -eq "LAUNCHPAD_CONTRACT_ADDRESS=") {
    Write-Host "❌ Contract address not set in .env file." -ForegroundColor Red
    Write-Host "   Please run setup-complete.ps1 to deploy the contract first." -ForegroundColor Yellow
    exit 1
}

# Check if database is running
try {
    docker ps --filter "name=postgres" --format "table {{.Names}}\t{{.Status}}" | Out-Null
    Write-Host "✅ Database services are running" -ForegroundColor Green
} catch {
    Write-Host "❌ Database not running. Starting..." -ForegroundColor Yellow
    docker-compose up -d postgres redis
    Start-Sleep 5
}

# Start the backend
Write-Host "🔄 Starting backend indexer and API..." -ForegroundColor Yellow
Write-Host "   Backend will run at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

cargo run --bin backend