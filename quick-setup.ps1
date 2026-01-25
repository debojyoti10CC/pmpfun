# Quick Setup for Windows - Simplified Version
Write-Host "🚀 Quick Setup for Stellar Pump (Windows)" -ForegroundColor Green
Write-Host ""

# Check if we have build tools
Write-Host "🔍 Checking build environment..." -ForegroundColor Yellow
try {
    # Try to compile a simple Rust program to check if build tools work
    $testResult = cargo --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Cargo not found"
    }
    Write-Host "✅ Rust is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Rust build tools not properly configured" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Visual Studio Build Tools:" -ForegroundColor Yellow
    Write-Host "1. Run: .\install-build-tools.ps1" -ForegroundColor White
    Write-Host "2. Or manually install from: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor White
    Write-Host "3. Select 'C++ build tools' workload" -ForegroundColor White
    Write-Host "4. Restart terminal and run this script again" -ForegroundColor White
    exit 1
}

# Check Docker
Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

# Start database
Write-Host "🗄️ Starting database..." -ForegroundColor Yellow
docker-compose up -d postgres redis
Start-Sleep 3

# Create .env file
Write-Host "📝 Creating configuration..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Basic setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Install Visual Studio Build Tools if you haven't:" -ForegroundColor White
Write-Host "   .\install-build-tools.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. For now, let's test the frontend only:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set up Freighter wallet:" -ForegroundColor White
Write-Host "   - Switch to Testnet in Freighter" -ForegroundColor Gray
Write-Host "   - Get test XLM from https://friendbot.stellar.org" -ForegroundColor Gray
Write-Host ""
Write-Host "4. After installing build tools, run full setup:" -ForegroundColor White
Write-Host "   .\setup-complete.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "🌟 Your frontend should work for testing the UI!" -ForegroundColor Green