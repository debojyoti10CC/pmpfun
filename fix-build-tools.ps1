# Fix Build Tools - Direct Installation
Write-Host "🔧 Fixing Visual Studio Build Tools" -ForegroundColor Green

# Method 1: Try to find existing installation
Write-Host "🔍 Checking for existing Visual Studio installations..." -ForegroundColor Yellow

$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vsWhere) {
    $installations = & $vsWhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($installations) {
        Write-Host "✅ Found Visual Studio with C++ tools:" -ForegroundColor Green
        $installations | ForEach-Object { Write-Host "   $_" -ForegroundColor Cyan }
        
        # Try to add to PATH
        foreach ($install in $installations) {
            $vcvars = "$install\VC\Auxiliary\Build\vcvars64.bat"
            if (Test-Path $vcvars) {
                Write-Host "🔧 Setting up build environment..." -ForegroundColor Yellow
                cmd /c "`"$vcvars`" && set" | ForEach-Object {
                    if ($_ -match "^([^=]+)=(.*)$") {
                        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
                    }
                }
                Write-Host "✅ Build environment configured" -ForegroundColor Green
                return
            }
        }
    }
}

# Method 2: Download and install Build Tools
Write-Host "📥 Downloading Visual Studio Build Tools..." -ForegroundColor Yellow
$buildToolsUrl = "https://aka.ms/vs/17/release/vs_buildtools.exe"
$installerPath = "$env:TEMP\vs_buildtools.exe"

try {
    Invoke-WebRequest -Uri $buildToolsUrl -OutFile $installerPath -UseBasicParsing
    
    Write-Host "🚀 Installing Build Tools (this may take a few minutes)..." -ForegroundColor Yellow
    Write-Host "   Installing C++ build tools automatically..." -ForegroundColor White
    
    # Install silently with C++ workload
    $process = Start-Process -FilePath $installerPath -ArgumentList @(
        "--quiet",
        "--wait",
        "--add", "Microsoft.VisualStudio.Workload.VCTools",
        "--add", "Microsoft.VisualStudio.Component.Windows10SDK.19041"
    ) -PassThru -Wait
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ Build Tools installed successfully!" -ForegroundColor Green
        Write-Host "🔄 Please restart your terminal and run the deployment script again." -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Automatic installation may have issues. Exit code: $($process.ExitCode)" -ForegroundColor Yellow
        Write-Host "📖 Manual installation steps:" -ForegroundColor Cyan
        Write-Host "   1. Run the installer: $installerPath" -ForegroundColor White
        Write-Host "   2. Select 'C++ build tools' workload" -ForegroundColor White
        Write-Host "   3. Click Install" -ForegroundColor White
        Write-Host "   4. Restart terminal after installation" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🌐 Please download manually from:" -ForegroundColor Yellow
    Write-Host "   https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor White
}

Write-Host ""
Write-Host "🔄 After installation:" -ForegroundColor Cyan
Write-Host "   1. Restart your terminal" -ForegroundColor White
Write-Host "   2. Run: .\deploy-contracts.ps1" -ForegroundColor White