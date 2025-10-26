# ================================================================
# IIS Setup Script for Procurement System
# ================================================================
#
# This script configures IIS as a reverse proxy to PM2/Next.js
#
# Prerequisites:
# - IIS installed and running
# - Application Request Routing (ARR) module installed
# - URL Rewrite module installed
# - Run as Administrator
#
# Usage:
#   .\setup-iis.ps1
#
# ================================================================

#Requires -RunAsAdministrator

Import-Module WebAdministration

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " IIS Configuration for Procurement System" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Variables
$siteName = "Procurement"
$appPoolName = "ProcurementAppPool"
$physicalPath = "D:\procurement\public"  # Physical path for IIS site
$hostname = "procurementapp"
$port = 80

# Check if IIS is installed
Write-Host "[1/8] Checking IIS installation..." -ForegroundColor Yellow
try {
    $iisVersion = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\InetStp").VersionString
    Write-Host "   ✓ IIS Version: $iisVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ IIS is not installed!" -ForegroundColor Red
    Write-Host "   Install IIS using Server Manager before running this script." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if ARR is installed
Write-Host "[2/8] Checking Application Request Routing (ARR)..." -ForegroundColor Yellow
$arrInstalled = Get-WindowsFeature -Name "Web-ARR" -ErrorAction SilentlyContinue
if (-not $arrInstalled -or $arrInstalled.InstallState -ne "Installed") {
    Write-Host "   ⚠ ARR module not detected" -ForegroundColor Yellow
    Write-Host "   Download from: https://www.iis.net/downloads/microsoft/application-request-routing" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "   Have you installed ARR manually? (Y/N)"
    if ($confirm -ne 'Y' -and $confirm -ne 'y') {
        Write-Host "   Please install ARR and try again." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "   ✓ ARR module is installed" -ForegroundColor Green
}

Write-Host ""

# Check if URL Rewrite is installed
Write-Host "[3/8] Checking URL Rewrite module..." -ForegroundColor Yellow
$rewriteInstalled = Get-WindowsFeature -Name "Web-Url-Rewrite" -ErrorAction SilentlyContinue
if (-not $rewriteInstalled -or $rewriteInstalled.InstallState -ne "Installed") {
    Write-Host "   ⚠ URL Rewrite module not detected" -ForegroundColor Yellow
    Write-Host "   Download from: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "   Have you installed URL Rewrite manually? (Y/N)"
    if ($confirm -ne 'Y' -and $confirm -ne 'y') {
        Write-Host "   Please install URL Rewrite and try again." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "   ✓ URL Rewrite module is installed" -ForegroundColor Green
}

Write-Host ""

# Create physical path if it doesn't exist
Write-Host "[4/8] Creating physical path..." -ForegroundColor Yellow
if (-not (Test-Path $physicalPath)) {
    New-Item -Path $physicalPath -ItemType Directory -Force | Out-Null
    Write-Host "   ✓ Created: $physicalPath" -ForegroundColor Green
} else {
    Write-Host "   ✓ Path exists: $physicalPath" -ForegroundColor Green
}

# Create a placeholder index.html
$indexHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Procurement System</title>
</head>
<body>
    <h1>Procurement System - IIS Placeholder</h1>
    <p>If you see this page, IIS is running but the reverse proxy is not configured yet.</p>
</body>
</html>
"@
$indexHtml | Out-File -FilePath "$physicalPath\index.html" -Encoding UTF8 -Force

Write-Host ""

# Create Application Pool
Write-Host "[5/8] Creating Application Pool..." -ForegroundColor Yellow
$existingPool = Get-WebAppPoolState -Name $appPoolName -ErrorAction SilentlyContinue
if ($existingPool) {
    Write-Host "   ⚠ Application Pool '$appPoolName' already exists" -ForegroundColor Yellow
    $confirm = Read-Host "   Remove and recreate? (Y/N)"
    if ($confirm -eq 'Y' -or $confirm -eq 'y') {
        Remove-WebAppPool -Name $appPoolName
        Write-Host "   ✓ Removed existing pool" -ForegroundColor Green
    } else {
        Write-Host "   Using existing pool" -ForegroundColor Yellow
    }
}

if (-not (Get-WebAppPoolState -Name $appPoolName -ErrorAction SilentlyContinue)) {
    New-WebAppPool -Name $appPoolName

    # Configure App Pool
    Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
    Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "startMode" -Value "AlwaysRunning"
    Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "processModel.idleTimeout" -Value "00:00:00"

    Write-Host "   ✓ Application Pool created and configured" -ForegroundColor Green
    Write-Host "      - Managed Runtime: No Managed Code" -ForegroundColor Gray
    Write-Host "      - Start Mode: Always Running" -ForegroundColor Gray
    Write-Host "      - Idle Timeout: Disabled" -ForegroundColor Gray
}

Write-Host ""

# Create Website
Write-Host "[6/8] Creating IIS Website..." -ForegroundColor Yellow
$existingSite = Get-Website -Name $siteName -ErrorAction SilentlyContinue
if ($existingSite) {
    Write-Host "   ⚠ Website '$siteName' already exists" -ForegroundColor Yellow
    $confirm = Read-Host "   Remove and recreate? (Y/N)"
    if ($confirm -eq 'Y' -or $confirm -eq 'y') {
        Remove-Website -Name $siteName
        Write-Host "   ✓ Removed existing site" -ForegroundColor Green
    } else {
        Write-Host "   Using existing site" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Skipping to web.config deployment..." -ForegroundColor Yellow
        $skipSiteCreation = $true
    }
}

if (-not $skipSiteCreation) {
    New-Website -Name $siteName `
                -PhysicalPath $physicalPath `
                -ApplicationPool $appPoolName `
                -Port $port `
                -HostHeader $hostname

    Write-Host "   ✓ Website created successfully" -ForegroundColor Green
    Write-Host "      - Name: $siteName" -ForegroundColor Gray
    Write-Host "      - Port: $port" -ForegroundColor Gray
    Write-Host "      - Hostname: $hostname" -ForegroundColor Gray
    Write-Host "      - Path: $physicalPath" -ForegroundColor Gray
}

Write-Host ""

# Copy web.config
Write-Host "[7/8] Deploying web.config..." -ForegroundColor Yellow
$webConfigSource = Join-Path $PSScriptRoot "web.config"
$webConfigDest = Join-Path $physicalPath "web.config"

if (Test-Path $webConfigSource) {
    Copy-Item -Path $webConfigSource -Destination $webConfigDest -Force
    Write-Host "   ✓ web.config deployed to $webConfigDest" -ForegroundColor Green
} else {
    Write-Host "   ⚠ web.config not found in script directory!" -ForegroundColor Yellow
    Write-Host "   Please copy web.config manually to: $webConfigDest" -ForegroundColor Yellow
}

Write-Host ""

# Enable ARR Proxy
Write-Host "[8/8] Enabling ARR Proxy..." -ForegroundColor Yellow
try {
    $arrConfig = Get-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" `
                                              -Filter "system.webServer/proxy" `
                                              -Name "enabled"

    if ($arrConfig.Value -eq $false) {
        Set-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" `
                                     -Filter "system.webServer/proxy" `
                                     -Name "enabled" `
                                     -Value $true
        Write-Host "   ✓ ARR Proxy enabled" -ForegroundColor Green
    } else {
        Write-Host "   ✓ ARR Proxy already enabled" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠ Could not enable ARR Proxy automatically" -ForegroundColor Yellow
    Write-Host "   Enable it manually in IIS Manager → Server Farms → Proxy Settings" -ForegroundColor Yellow
}

Write-Host ""

# Start the website
Write-Host "Starting website..." -ForegroundColor Yellow
try {
    Start-Website -Name $siteName
    Write-Host "   ✓ Website started successfully" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Could not start website automatically" -ForegroundColor Yellow
    Write-Host "   Error: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " ✓ IIS Configuration Completed!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Website Details:" -ForegroundColor Yellow
Write-Host "  - Name: $siteName" -ForegroundColor White
Write-Host "  - URL: http://$hostname" -ForegroundColor White
Write-Host "  - Physical Path: $physicalPath" -ForegroundColor White
Write-Host "  - Application Pool: $appPoolName" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Ensure PM2 is running with the application" -ForegroundColor White
Write-Host "2. Test backend: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "3. Test IIS proxy: http://$hostname/api/health" -ForegroundColor White
Write-Host "4. Add DNS/hosts entry if needed:" -ForegroundColor White
Write-Host "   C:\Windows\System32\drivers\etc\hosts" -ForegroundColor Gray
Write-Host "   <SERVER-IP>  $hostname" -ForegroundColor Gray
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "- Check IIS logs: C:\inetpub\logs\LogFiles" -ForegroundColor White
Write-Host "- Check PM2 logs: pm2 logs" -ForegroundColor White
Write-Host "- Verify web.config is in place: $webConfigDest" -ForegroundColor White
Write-Host ""
