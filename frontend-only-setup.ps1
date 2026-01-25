# Frontend-Only Setup - Test the UI without backend
Write-Host "🎨 Setting up Frontend-Only Testing Environment" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "📥 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create basic .env for frontend
Set-Location ..
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Frontend-Only Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting frontend..." -ForegroundColor Cyan
Write-Host "   The app will open at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🎯 What you can test:" -ForegroundColor Yellow
Write-Host "   ✅ Wallet connection (Freighter)" -ForegroundColor White
Write-Host "   ✅ UI navigation and design" -ForegroundColor White
Write-Host "   ✅ Token creation form" -ForegroundColor White
Write-Host "   ✅ Responsive design" -ForegroundColor White
Write-Host "   ✅ All frontend functionality" -ForegroundColor White
Write-Host ""
Write-Host "📝 Setup Freighter:" -ForegroundColor Cyan
Write-Host "   1. Switch to Testnet in Freighter extension" -ForegroundColor White
Write-Host "   2. Get test XLM: https://friendbot.stellar.org" -ForegroundColor White
Write-Host ""
Write-Host "🔧 To add backend later:" -ForegroundColor Yellow
Write-Host "   1. Fix Docker Desktop installation" -ForegroundColor White
Write-Host "   2. Run: .\setup-complete.ps1" -ForegroundColor White
Write-Host ""

# Start the frontend
Set-Location frontend
Write-Host "Starting React development server..." -ForegroundColor Green
npm start