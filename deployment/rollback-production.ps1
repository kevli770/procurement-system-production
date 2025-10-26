<#
.SYNOPSIS
    Manual rollback script to restore a previous version

.DESCRIPTION
    This script allows you to manually rollback to any previous backup.
    Use this when you discover issues after deployment that weren't caught by health checks.

.PARAMETER ToVersion
    The version to rollback to (must match a backup folder)

.PARAMETER Force
    Skip confirmation prompts

.EXAMPLE
    .\rollback-production.ps1 -ToVersion "1.0.0"

.EXAMPLE
    .\rollback-production.ps1 -ToVersion "1.0.0" -Force
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ToVersion,

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Configuration
$ErrorActionPreference = "Stop"
$AppName = "procurement"
$DeployPath = "C:\inetpub\$AppName"
$BackupPath = "C:\backups\$AppName"

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

# List available backups
function Get-AvailableBackups {
    Write-Info "`nAvailable backups:"

    $backups = Get-ChildItem -Path $BackupPath -Directory | Where-Object { $_.Name -match '^v\d+\.\d+\.\d+-\d+' } | Sort-Object CreationTime -Descending

    if ($backups.Count -eq 0) {
        Write-Warning "No backups found in $BackupPath"
        return $null
    }

    $i = 1
    foreach ($backup in $backups) {
        $size = (Get-ChildItem -Path $backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        $version = $backup.Name -replace '-\d+$', ''

        Write-Info "  [$i] $version - $($backup.CreationTime.ToString('yyyy-MM-dd HH:mm')) - $([math]::Round($size, 2)) MB"
        $i++
    }

    return $backups
}

# Select backup
function Select-Backup {
    param([string]$Version)

    $backups = Get-AvailableBackups

    if (-not $backups) {
        throw "No backups available for rollback"
    }

    if ($Version) {
        # Find backup matching the specified version
        $backup = $backups | Where-Object { $_.Name -match "^v$Version-" } | Select-Object -First 1

        if (-not $backup) {
            throw "No backup found for version $Version"
        }

        Write-Info "`nSelected backup: $($backup.Name)"
        return $backup
    }
    else {
        # Let user select
        Write-Info "`nNo version specified. Please select a backup:"
        $selection = Read-Host "Enter backup number (1-$($backups.Count))"

        try {
            $index = [int]$selection - 1
            if ($index -lt 0 -or $index -ge $backups.Count) {
                throw "Invalid selection"
            }

            return $backups[$index]
        }
        catch {
            throw "Invalid backup selection"
        }
    }
}

# Perform rollback
function Start-Rollback {
    param($Backup)

    Write-Warning "`n========================================="
    Write-Warning "  ROLLBACK OPERATION"
    Write-Warning "========================================="
    Write-Warning "Target: $($Backup.Name)"
    Write-Warning "Path: $($Backup.FullName)"
    Write-Warning "Created: $($Backup.CreationTime)"
    Write-Warning "=========================================`n"

    if (-not $Force) {
        Write-Warning "WARNING: This will replace your current deployment!"
        $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
        if ($confirm -ne "yes") {
            Write-Info "Rollback cancelled"
            return
        }
    }

    try {
        # Stop application
        Write-Info "`n[1/4] Stopping application..."
        try {
            pm2 stop $AppName
            Write-Success "Application stopped"
        }
        catch {
            Write-Warning "Failed to stop application (it may not be running)"
        }

        # Remove current deployment
        Write-Info "`n[2/4] Removing current deployment..."
        if (Test-Path $DeployPath) {
            Remove-Item -Path "$DeployPath\*" -Recurse -Force
            Write-Success "Current deployment removed"
        }

        # Restore backup
        Write-Info "`n[3/4] Restoring backup..."
        Copy-Item -Path "$($Backup.FullName)\*" -Destination $DeployPath -Recurse -Force
        Write-Success "Backup restored"

        # Start application
        Write-Info "`n[4/4] Starting application..."
        Push-Location $DeployPath
        try {
            pm2 start ecosystem.config.js
            Write-Success "Application started"
        }
        finally {
            Pop-Location
        }

        # Wait and check if running
        Start-Sleep -Seconds 5
        $pm2List = pm2 jlist | ConvertFrom-Json
        $app = $pm2List | Where-Object { $_.name -eq $AppName }

        if ($app -and $app.pm2_env.status -eq "online") {
            Write-Success "`n========================================="
            Write-Success " ROLLBACK SUCCESSFUL!"
            Write-Success "========================================="
            Write-Success "Restored version: $($Backup.Name)"
            Write-Success "Application status: $($app.pm2_env.status)"
            Write-Success "=========================================`n"
        }
        else {
            Write-Warning "`nApplication may not be running properly. Please check manually with: pm2 status"
        }

    }
    catch {
        Write-Error "`n========================================="
        Write-Error " ROLLBACK FAILED!"
        Write-Error "========================================="
        Write-Error "Error: $_"
        Write-Error "=========================================`n"

        exit 1
    }
}

# Main execution
try {
    $backup = Select-Backup -Version $ToVersion
    Start-Rollback -Backup $backup
}
catch {
    Write-Error "Rollback error: $_"
    exit 1
}
