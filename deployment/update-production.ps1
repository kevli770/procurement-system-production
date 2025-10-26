<#
.SYNOPSIS
    Automated production deployment script with rollback capability

.DESCRIPTION
    This script automates the deployment of new versions to production with:
    - Automatic backup of current version and database
    - Health checks before and after deployment
    - Automatic rollback if deployment fails
    - Prisma migrations to safely update database schema

.PARAMETER Version
    The version to deploy (e.g., "1.0.0" for v1.0.0 release)

.PARAMETER SkipBackup
    Skip the backup step (not recommended for production!)

.PARAMETER Force
    Skip confirmation prompts

.EXAMPLE
    .\update-production.ps1 -Version "1.0.0"

.EXAMPLE
    .\update-production.ps1 -Version "1.1.0" -Force
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,

    [Parameter(Mandatory=$false)]
    [switch]$SkipBackup,

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Configuration
$ErrorActionPreference = "Stop"
$RepoOwner = "umitgh"
$RepoName = "procurement-system"
$AppName = "procurement"
$DeployPath = "C:\inetpub\$AppName"
$BackupPath = "C:\backups\$AppName"
$TempPath = "$env:TEMP\$AppName-update"
$LogPath = "$BackupPath\logs"
$MaxBackups = 10

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }

# Create necessary directories
function Initialize-Directories {
    Write-Info "Initializing directories..."

    $dirs = @($BackupPath, $LogPath, $TempPath)
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Success "  Created: $dir"
        }
    }
}

# Setup logging
$LogFile = "$LogPath\deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logMessage

    switch ($Level) {
        "ERROR" { Write-Error $Message }
        "WARNING" { Write-Warning $Message }
        "SUCCESS" { Write-Success $Message }
        default { Write-Info $Message }
    }
}

# Check if PM2 is installed and running
function Test-PM2 {
    Write-Log "Checking PM2..."
    try {
        $pm2Version = pm2 --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "PM2 is not installed or not in PATH"
        }
        Write-Log "PM2 is installed (version: $pm2Version)" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "PM2 check failed: $_" "ERROR"
        return $false
    }
}

# Check if application is currently running
function Test-ApplicationRunning {
    Write-Log "Checking if application is running..."
    try {
        $pm2List = pm2 jlist | ConvertFrom-Json
        $app = $pm2List | Where-Object { $_.name -eq $AppName }

        if ($app) {
            Write-Log "Application '$AppName' is running (status: $($app.pm2_env.status))" "SUCCESS"
            return $true
        }
        else {
            Write-Log "Application '$AppName' is not running" "WARNING"
            return $false
        }
    }
    catch {
        Write-Log "Failed to check application status: $_" "WARNING"
        return $false
    }
}

# Health check
function Test-ApplicationHealth {
    param([int]$TimeoutSeconds = 30)

    Write-Log "Performing health check..."

    # Wait a bit for the application to start
    Start-Sleep -Seconds 5

    $healthUrl = "http://localhost:3000/api/health"
    $maxAttempts = $TimeoutSeconds / 5
    $attempt = 0

    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Log "Health check passed!" "SUCCESS"
                return $true
            }
        }
        catch {
            $attempt++
            if ($attempt -lt $maxAttempts) {
                Write-Log "Health check attempt $attempt failed, retrying..." "WARNING"
                Start-Sleep -Seconds 5
            }
        }
    }

    Write-Log "Health check failed after $maxAttempts attempts" "ERROR"
    return $false
}

# Download release from GitHub
function Get-ReleasePackage {
    param([string]$Version)

    Write-Log "Downloading release package v$Version..."

    $downloadUrl = "https://github.com/$RepoOwner/$RepoName/releases/download/v$Version/procurement-v$Version.zip"
    $zipPath = "$TempPath\procurement-v$Version.zip"

    try {
        # Check if release exists
        $headers = @{ "User-Agent" = "PowerShell-UpdateScript" }
        $releaseInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/$RepoOwner/$RepoName/releases/tags/v$Version" -Headers $headers

        Write-Log "Release found: $($releaseInfo.name)"
        Write-Log "Downloading from: $downloadUrl"

        # Download the ZIP
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -Headers $headers

        if (Test-Path $zipPath) {
            $fileSize = (Get-Item $zipPath).Length / 1MB
            Write-Log "Download complete! Size: $([math]::Round($fileSize, 2)) MB" "SUCCESS"
            return $zipPath
        }
        else {
            throw "Downloaded file not found at $zipPath"
        }
    }
    catch {
        Write-Log "Failed to download release: $_" "ERROR"
        throw
    }
}

# Backup current version
function Backup-CurrentVersion {
    param([string]$Version)

    if ($SkipBackup) {
        Write-Log "Skipping backup as requested" "WARNING"
        return $null
    }

    Write-Log "Creating backup of current version..."

    $backupDir = "$BackupPath\v$Version-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

    try {
        # Backup application files
        Write-Log "Backing up application files..."
        Copy-Item -Path $DeployPath -Destination $backupDir -Recurse -Force

        Write-Log "Backup created successfully at: $backupDir" "SUCCESS"

        # Clean old backups (keep only last $MaxBackups)
        $allBackups = Get-ChildItem -Path $BackupPath -Directory | Where-Object { $_.Name -match '^v\d+\.\d+\.\d+-\d+' } | Sort-Object CreationTime -Descending

        if ($allBackups.Count -gt $MaxBackups) {
            Write-Log "Cleaning old backups (keeping last $MaxBackups)..."
            $allBackups | Select-Object -Skip $MaxBackups | ForEach-Object {
                Write-Log "  Removing old backup: $($_.Name)"
                Remove-Item -Path $_.FullName -Recurse -Force
            }
        }

        return $backupDir
    }
    catch {
        Write-Log "Backup failed: $_" "ERROR"
        throw
    }
}

# Extract and deploy new version
function Deploy-NewVersion {
    param([string]$ZipPath)

    Write-Log "Extracting deployment package..."

    $extractPath = "$TempPath\extracted"

    try {
        # Extract ZIP
        if (Test-Path $extractPath) {
            Remove-Item -Path $extractPath -Recurse -Force
        }

        Expand-Archive -Path $ZipPath -DestinationPath $extractPath -Force
        Write-Log "Package extracted successfully" "SUCCESS"

        # Stop the application
        Write-Log "Stopping application..."
        try {
            pm2 stop $AppName
            Write-Log "Application stopped" "SUCCESS"
        }
        catch {
            Write-Log "Failed to stop application (it may not be running): $_" "WARNING"
        }

        # Backup .env file (don't overwrite it!)
        $envBackup = $null
        if (Test-Path "$DeployPath\.env") {
            $envBackup = "$TempPath\.env.backup"
            Copy-Item -Path "$DeployPath\.env" -Destination $envBackup -Force
            Write-Log "Backed up .env file" "SUCCESS"
        }

        # Backup database file (don't overwrite it!)
        $dbBackup = $null
        $dbPath = Get-ChildItem -Path "$DeployPath\prisma" -Filter "*.db" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($dbPath) {
            $dbBackup = "$TempPath\$($dbPath.Name).backup"
            Copy-Item -Path $dbPath.FullName -Destination $dbBackup -Force
            Write-Log "Backed up database file: $($dbPath.Name)" "SUCCESS"
        }

        # Deploy new files (this will overwrite everything except .env and .db)
        Write-Log "Deploying new version..."
        Copy-Item -Path "$extractPath\*" -Destination $DeployPath -Recurse -Force

        # Restore .env
        if ($envBackup -and (Test-Path $envBackup)) {
            Copy-Item -Path $envBackup -Destination "$DeployPath\.env" -Force
            Write-Log "Restored .env file" "SUCCESS"
        }

        # Restore database
        if ($dbBackup -and (Test-Path $dbBackup)) {
            Copy-Item -Path $dbBackup -Destination "$DeployPath\prisma\$(Split-Path $dbPath -Leaf)" -Force
            Write-Log "Restored database file" "SUCCESS"
        }

        # Run Prisma migrations (this is safe - it won't delete data!)
        Write-Log "Running database migrations..."
        Push-Location $DeployPath
        try {
            npx prisma migrate deploy
            Write-Log "Database migrations completed" "SUCCESS"
        }
        catch {
            Write-Log "Database migration warning: $_" "WARNING"
            # Don't fail the deployment if migrations have issues
        }
        finally {
            Pop-Location
        }

        Write-Log "Deployment completed successfully" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Deployment failed: $_" "ERROR"
        throw
    }
}

# Rollback to backup
function Restore-Backup {
    param([string]$BackupDir)

    if (-not $BackupDir -or -not (Test-Path $BackupDir)) {
        Write-Log "No backup available for rollback!" "ERROR"
        return $false
    }

    Write-Log "Rolling back to backup: $BackupDir" "WARNING"

    try {
        # Stop the application
        pm2 stop $AppName 2>&1 | Out-Null

        # Remove failed deployment
        if (Test-Path $DeployPath) {
            Remove-Item -Path "$DeployPath\*" -Recurse -Force
        }

        # Restore backup
        Copy-Item -Path "$BackupDir\*" -Destination $DeployPath -Recurse -Force

        Write-Log "Backup restored successfully" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Rollback failed: $_" "ERROR"
        return $false
    }
}

# Main deployment process
function Start-Deployment {
    Write-Info "`n========================================="
    Write-Info "  Procurement System - Update Script"
    Write-Info "========================================="
    Write-Info "Version: v$Version"
    Write-Info "Deploy Path: $DeployPath"
    Write-Info "Backup Path: $BackupPath"
    Write-Info "=========================================`n"

    try {
        # Initialize
        Initialize-Directories
        Write-Log "Starting deployment of version $Version"

        # Pre-flight checks
        Write-Log "`n--- Pre-flight Checks ---"
        if (-not (Test-PM2)) {
            throw "PM2 is not available. Please install PM2 first."
        }

        $wasRunning = Test-ApplicationRunning

        # Confirm deployment
        if (-not $Force) {
            Write-Warning "`nYou are about to deploy version v$Version to production."
            $confirm = Read-Host "Continue? (yes/no)"
            if ($confirm -ne "yes") {
                Write-Log "Deployment cancelled by user" "WARNING"
                return
            }
        }

        # Download release
        Write-Log "`n--- Downloading Release ---"
        $zipPath = Get-ReleasePackage -Version $Version

        # Backup current version
        Write-Log "`n--- Creating Backup ---"
        $backupDir = Backup-CurrentVersion -Version $Version

        # Deploy new version
        Write-Log "`n--- Deploying New Version ---"
        Deploy-NewVersion -ZipPath $zipPath

        # Start application
        Write-Log "`n--- Starting Application ---"
        try {
            Push-Location $DeployPath
            pm2 start ecosystem.config.js
            Write-Log "Application started" "SUCCESS"
        }
        catch {
            Write-Log "Failed to start application: $_" "ERROR"
            throw
        }
        finally {
            Pop-Location
        }

        # Health check
        Write-Log "`n--- Health Check ---"
        if (-not (Test-ApplicationHealth)) {
            Write-Log "Health check failed! Initiating rollback..." "ERROR"

            if (Restore-Backup -BackupDir $backupDir) {
                Write-Log "Rollback completed. Starting old version..."
                pm2 start $AppName

                if (Test-ApplicationHealth) {
                    Write-Log "Rollback successful. Old version is running." "SUCCESS"
                }
                else {
                    Write-Log "Rollback completed but health check still failing. Manual intervention required!" "ERROR"
                }
            }

            throw "Deployment failed and was rolled back"
        }

        # Cleanup
        Write-Log "`n--- Cleanup ---"
        if (Test-Path $TempPath) {
            Remove-Item -Path $TempPath -Recurse -Force
            Write-Log "Temporary files cleaned up"
        }

        # Success!
        Write-Log "`n=========================================" "SUCCESS"
        Write-Log " DEPLOYMENT SUCCESSFUL!" "SUCCESS"
        Write-Log "=========================================" "SUCCESS"
        Write-Log "Version: v$Version" "SUCCESS"
        Write-Log "Backup: $backupDir" "SUCCESS"
        Write-Log "Log: $LogFile" "SUCCESS"
        Write-Log "=========================================`n" "SUCCESS"

    }
    catch {
        Write-Log "`n=========================================" "ERROR"
        Write-Log " DEPLOYMENT FAILED!" "ERROR"
        Write-Log "=========================================" "ERROR"
        Write-Log "Error: $_" "ERROR"
        Write-Log "Log: $LogFile" "ERROR"
        Write-Log "=========================================`n" "ERROR"

        exit 1
    }
}

# Run deployment
Start-Deployment
