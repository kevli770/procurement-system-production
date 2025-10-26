# ================================================================
# PM2 Windows Service Installation Script
# Procurement System - Production Deployment
# ================================================================
#
# This script installs PM2 as a Windows Service with automatic startup
#
# Prerequisites:
# - Node.js 20.x LTS installed
# - npm available in PATH
# - Run as Administrator
#
# Usage:
#   .\install-pm2-service.ps1
#
# ================================================================

# Require Administrator privileges
#Requires -RunAsAdministrator

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " PM2 Windows Service Installation" -ForegroundColor Cyan
Write-Host " Procurement System" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "[1/6] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "   Please install Node.js 20.x LTS and try again." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "   ✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ npm is not available!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install PM2 globally
Write-Host "[2/6] Installing PM2 globally..." -ForegroundColor Yellow
try {
    npm install -g pm2 --silent
    Write-Host "   ✓ PM2 installed successfully" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to install PM2!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verify PM2 installation
Write-Host "[3/6] Verifying PM2 installation..." -ForegroundColor Yellow
try {
    $pm2Version = pm2 --version
    Write-Host "   ✓ PM2 version: $pm2Version" -ForegroundColor Green
} catch {
    Write-Host "   ✗ PM2 verification failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install pm2-windows-service
Write-Host "[4/6] Installing pm2-windows-service..." -ForegroundColor Yellow
try {
    npm install -g pm2-windows-service --silent
    Write-Host "   ✓ pm2-windows-service installed successfully" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to install pm2-windows-service!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if PM2 service already exists
$serviceName = "PM2"
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if ($existingService) {
    Write-Host "   ⚠ PM2 service already exists!" -ForegroundColor Yellow
    Write-Host "   Service Status: $($existingService.Status)" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "   Do you want to uninstall and reinstall? (Y/N)"
    if ($confirm -eq 'Y' -or $confirm -eq 'y') {
        Write-Host "   Uninstalling existing service..." -ForegroundColor Yellow
        try {
            pm2-service-uninstall
            Start-Sleep -Seconds 3
            Write-Host "   ✓ Existing service uninstalled" -ForegroundColor Green
        } catch {
            Write-Host "   ✗ Failed to uninstall existing service!" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   Installation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""

# Install PM2 as Windows Service
Write-Host "[5/6] Installing PM2 as Windows Service..." -ForegroundColor Yellow
Write-Host "   Service Name: PM2" -ForegroundColor Cyan
Write-Host "   Startup Type: Automatic" -ForegroundColor Cyan
Write-Host "   Account: Local System" -ForegroundColor Cyan
Write-Host ""

try {
    # Install service with automatic startup
    pm2-service-install -n PM2

    Write-Host "   ✓ PM2 Windows Service installed successfully" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to install PM2 service!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Configure service recovery options
Write-Host "[6/6] Configuring service recovery options..." -ForegroundColor Yellow
try {
    # Set recovery options: restart on failure
    sc.exe failure PM2 reset= 86400 actions= restart/5000/restart/10000/restart/30000

    Write-Host "   ✓ Recovery options configured:" -ForegroundColor Green
    Write-Host "      - 1st failure: restart after 5 seconds" -ForegroundColor Gray
    Write-Host "      - 2nd failure: restart after 10 seconds" -ForegroundColor Gray
    Write-Host "      - 3rd+ failure: restart after 30 seconds" -ForegroundColor Gray
    Write-Host "      - Reset counter after 24 hours" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠ Warning: Could not set recovery options" -ForegroundColor Yellow
    Write-Host "   You can set these manually in Services (services.msc)" -ForegroundColor Yellow
}

Write-Host ""

# Verify service status
Write-Host "Verifying service installation..." -ForegroundColor Yellow
$service = Get-Service -Name "PM2" -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "   ✓ Service Status: $($service.Status)" -ForegroundColor Green
    Write-Host "   ✓ Startup Type: $($service.StartType)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Service verification failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " ✓ PM2 Windows Service Installed Successfully!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy ecosystem.config.js to D:\procurement\" -ForegroundColor White
Write-Host "2. Run: pm2 start D:\procurement\ecosystem.config.js" -ForegroundColor White
Write-Host "3. Run: pm2 save" -ForegroundColor White
Write-Host "4. Verify: pm2 list" -ForegroundColor White
Write-Host ""
Write-Host "Service Management:" -ForegroundColor Yellow
Write-Host "- Start:   Start-Service -Name 'PM2'" -ForegroundColor White
Write-Host "- Stop:    Stop-Service -Name 'PM2'" -ForegroundColor White
Write-Host "- Restart: Restart-Service -Name 'PM2'" -ForegroundColor White
Write-Host "- Status:  Get-Service -Name 'PM2'" -ForegroundColor White
Write-Host ""
Write-Host "Monitoring:" -ForegroundColor Yellow
Write-Host "- List apps:  pm2 list" -ForegroundColor White
Write-Host "- Monitor:    pm2 monit" -ForegroundColor White
Write-Host "- Logs:       pm2 logs" -ForegroundColor White
Write-Host ""
