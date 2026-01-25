# Install Visual Studio Build Tools for Rust compilation
Write-Host "🔧 Installing Visual Studio Build Tools..." -ForegroundColor Yellow

# Download Visual Studio Build Tools installer
$buildToolsUrl = "https://aka.ms/vs/17/release/vs_buildtools.exe"
$installerPath = "$env:TEMP\vs_buildtools.exe"

Write-Host "   Downloading installer..." -ForegroundColor White
try {
    Invoke-WebRequest -Uri $buildToolsUrl -OutFile $installerPath
    
    Write-Host "   Starting installation..." -ForegroundColor White
    Write-Host "   This will open the Visual Studio Installer." -ForegroundColor Cyan
    Write-Host "   Please select 'C++ build tools' and install." -ForegroundColor Cyan
    
    Start-Process -FilePath $installerPath -ArgumentList "--wait", "--add", "Microsoft.VisualStudio.Workload.VCTools" -Wait
    
    Write-Host "✅ Build tools installation completed!" -ForegroundColor Green
    Write-Host "   Please restart your terminal and run the setup again." -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Failed to download build tools installer" -ForegroundColor Red
    Write-Host "   Please manually install from: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Yellow
    Write-Host "   Select 'C++ build tools' workload during installation" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 After installation, restart your terminal and run:" -ForegroundColor Cyan
Write-Host "   .\setup-complete.ps1" -ForegroundColor White