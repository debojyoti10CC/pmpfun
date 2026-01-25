# Windows Setup Guide for Stellar Pump Launchpad

## Quick Setup

1. **Run the automated setup script** (as Administrator):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\setup-windows.ps1
   ```

## Manual Setup (if automated script fails)

### 1. Install Prerequisites

#### Stellar CLI
```powershell
# Download Windows version
$url = "https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-pc-windows-msvc.zip"
Invoke-WebRequest -Uri $url -OutFile "stellar-cli.zip"
Expand-Archive -Path "stellar-cli.zip" -DestinationPath "C:\stellar"

# Add to PATH manually:
# 1. Open System Properties > Environment Variables
# 2. Add C:\stellar to your PATH variable
```

#### Rust
```powershell
# Download and install Rust
Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "rustup-init.exe"
.\rustup-init.exe

# Add WASM target
rustup target add wasm32-unknown-unknown
```

#### Node.js
Download and install from: https://nodejs.org/

#### Docker Desktop
Download and install from: https://www.docker.com/products/docker-desktop/

### 2. Fix Docker Compose Issue

The docker-compose.yml has been updated to use version 3.3 (compatible with older Docker versions).

```powershell
# Start database services
docker-compose up -d postgres redis
```

### 3. Build and Deploy Contract

```powershell
# Build the contract
cd contracts/launchpad
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet (after setting up Stellar CLI)
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/stellar_pump_launchpad.wasm `
  --network testnet `
  --source-account YOUR_ACCOUNT_SECRET_KEY
```

### 4. Configure Environment

Update `.env` file with your contract address:
```
LAUNCHPAD_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ID
```

### 5. Start Services

```powershell
# Terminal 1: Start backend
cargo run --bin backend

# Terminal 2: Start frontend
cd frontend
npm start
```

## Troubleshooting

### Issue: "sudo is disabled"
**Solution**: Windows doesn't use sudo. Run PowerShell as Administrator instead.

### Issue: "sh is not recognized"
**Solution**: Use the Windows-specific Rust installer instead:
```powershell
Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "rustup-init.exe"
.\rustup-init.exe
```

### Issue: Docker Compose version error
**Solution**: The docker-compose.yml has been updated to use version 3.3.

### Issue: Stellar CLI not found after installation
**Solution**: 
1. Restart your terminal
2. Or manually add the Stellar CLI directory to your PATH environment variable

### Issue: Database connection errors
**Solution**: 
1. Make sure Docker Desktop is running
2. Check if ports 5432 and 6379 are available
3. Run: `docker-compose logs postgres` to check for errors

## Development Workflow

1. **Make changes to contracts**:
   ```powershell
   cd contracts/launchpad
   cargo build --target wasm32-unknown-unknown --release
   # Redeploy if needed
   ```

2. **Test frontend changes**:
   ```powershell
   cd frontend
   npm start  # Hot reload enabled
   ```

3. **Test backend changes**:
   ```powershell
   cargo run --bin backend  # Restart after changes
   ```

## Production Deployment

For production deployment on Windows servers:

1. Use Windows Server with IIS or Docker containers
2. Set up PostgreSQL database (Azure Database, AWS RDS, etc.)
3. Configure SSL certificates
4. Set up monitoring with Windows Performance Toolkit
5. Use Windows Task Scheduler for background services

## Next Steps

After setup is complete:

1. **Test the system**: Create a test token and verify all functionality
2. **Deploy to mainnet**: Update network configuration and deploy contracts
3. **Set up monitoring**: Configure logging and alerting
4. **Security audit**: Review all smart contracts before mainnet deployment