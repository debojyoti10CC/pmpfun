# Windows Setup Script for Stellar Pump Launchpad
# Run this script in PowerShell as Administrator

Write-Host "Setting up Stellar Pump Launchpad on Windows..." -ForegroundColor Green

# 1. Install Stellar CLI for Windows
Write-Host "Installing Stellar CLI..." -ForegroundColor Yellow
$stellarUrl = "https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-pc-windows-msvc.zip"
$stellarZip = "$env:TEMP\stellar-cli.zip"
$stellarDir = "$env:LOCALAPPDATA\stellar"

# Download Stellar CLI
Invoke-WebRequest -Uri $stellarUrl -OutFile $stellarZip
Expand-Archive -Path $stellarZip -DestinationPath $stellarDir -Force

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$stellarDir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$stellarDir", "User")
    Write-Host "Added Stellar CLI to PATH. Please restart your terminal." -ForegroundColor Green
}

# 2. Install Rust (if not already installed)
Write-Host "Checking Rust installation..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version
    Write-Host "Rust is already installed: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Rust..." -ForegroundColor Yellow
    # Download and run rustup installer
    $rustupUrl = "https://win.rustup.rs/x86_64"
    $rustupExe = "$env:TEMP\rustup-init.exe"
    Invoke-WebRequest -Uri $rustupUrl -OutFile $rustupExe
    Start-Process -FilePath $rustupExe -ArgumentList "-y" -Wait
    
    # Refresh environment
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

# 3. Add WASM target
Write-Host "Adding WASM target..." -ForegroundColor Yellow
rustup target add wasm32-unknown-unknown

# 4. Install Node.js (if not already installed)
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js is already installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Write-Host "Then run this script again." -ForegroundColor Red
    exit 1
}

# 5. Install Docker Desktop (if not already installed)
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "Docker is already installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    Write-Host "Then run this script again." -ForegroundColor Red
    exit 1
}

# 6. Start database services
Write-Host "Starting database services..." -ForegroundColor Yellow
try {
    docker-compose up -d postgres redis
    Write-Host "Database services started successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error starting database services. Make sure Docker Desktop is running." -ForegroundColor Red
}

# 7. Create .env file from example
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env file from example. Please update it with your configuration." -ForegroundColor Yellow
}

# 8. Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update the .env file with your configuration" -ForegroundColor White
Write-Host "2. Build the Soroban contract: cd contracts/launchpad && cargo build --target wasm32-unknown-unknown --release" -ForegroundColor White
Write-Host "3. Deploy the contract to testnet using Stellar CLI" -ForegroundColor White
Write-Host "4. Start the frontend: cd frontend && npm start" -ForegroundColor White
Write-Host "5. Start the backend: cargo run --bin backend" -ForegroundColor White