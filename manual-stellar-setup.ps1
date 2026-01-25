# Manual Stellar CLI Setup - Alternative Download
Write-Host "🔧 Manual Stellar CLI Setup" -ForegroundColor Green

# Try alternative download method
Write-Host "📥 Downloading Stellar CLI (alternative method)..." -ForegroundColor Yellow

$stellarPath = "$env:LOCALAPPDATA\stellar"
New-Item -ItemType Directory -Path $stellarPath -Force | Out-Null

# Direct download with different approach
try {
    # Use curl if available
    if (Get-Command curl -ErrorAction SilentlyContinue) {
        Write-Host "   Using curl..." -ForegroundColor White
        curl -L "https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-pc-windows-msvc.zip" -o "$env:TEMP\stellar-cli.zip"
    } else {
        # Use WebClient
        Write-Host "   Using WebClient..." -ForegroundColor White
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile("https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-pc-windows-msvc.zip", "$env:TEMP\stellar-cli.zip")
    }
    
    # Extract
    Write-Host "   Extracting..." -ForegroundColor White
    Expand-Archive -Path "$env:TEMP\stellar-cli.zip" -DestinationPath $stellarPath -Force
    
    # Test if it works
    $testResult = & "$stellarPath\stellar.exe" --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Stellar CLI installed successfully!" -ForegroundColor Green
        Write-Host "   Version: $testResult" -ForegroundColor Cyan
        
        # Add to PATH
        $env:PATH += ";$stellarPath"
        
        return $true
    } else {
        throw "Installation test failed"
    }
    
} catch {
    Write-Host "❌ Automatic download failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔗 MANUAL DOWNLOAD REQUIRED:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://github.com/stellar/stellar-cli/releases/tag/v21.0.0" -ForegroundColor White
    Write-Host "   2. Download: stellar-cli-21.0.0-x86_64-pc-windows-msvc.zip" -ForegroundColor White
    Write-Host "   3. Extract to: $stellarPath" -ForegroundColor White
    Write-Host "   4. Run this script again" -ForegroundColor White
    
    return $false
}