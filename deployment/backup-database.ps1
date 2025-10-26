# ================================================================
# Database Backup Script
# Procurement System - SQLite Database Backup
# ================================================================
#
# This script creates a backup of the SQLite database with timestamp
# and manages retention policy (keeps backups for X days)
#
# Usage:
#   .\backup-database.ps1
#
# Scheduling (Task Scheduler):
#   Run daily at 2:00 AM
#
# ================================================================

param(
    [string]$DatabasePath = "D:\procurement\prisma\procurement.db",
    [string]$BackupPath = "D:\backups\procurement",
    [int]$RetentionDays = 30,
    [string]$AlertEmail = ""  # Optional: email for notifications
)

# Load environment variables for email (if .env exists)
$envFile = "D:\procurement\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Database Backup Utility" -ForegroundColor Cyan
Write-Host " Procurement System" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Verify database exists
if (-not (Test-Path $DatabasePath)) {
    Write-Host "✗ Database not found: $DatabasePath" -ForegroundColor Red
    exit 1
}

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupPath)) {
    New-Item -Path $BackupPath -ItemType Directory -Force | Out-Null
    Write-Host "✓ Created backup directory: $BackupPath" -ForegroundColor Green
}

# Generate backup filename with timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $BackupPath "procurement-db-$timestamp.db"

Write-Host "Backing up database..." -ForegroundColor Yellow
Write-Host "  Source: $DatabasePath" -ForegroundColor Gray
Write-Host "  Destination: $backupFile" -ForegroundColor Gray
Write-Host ""

try {
    # Get database size
    $dbSize = (Get-Item $DatabasePath).Length
    $dbSizeMB = [math]::Round($dbSize / 1MB, 2)

    Write-Host "Database size: $dbSizeMB MB" -ForegroundColor Cyan

    # Copy database file
    Copy-Item -Path $DatabasePath -Destination $backupFile -Force

    # Verify backup
    if (Test-Path $backupFile) {
        $backupSize = (Get-Item $backupFile).Length
        $backupSizeMB = [math]::Round($backupSize / 1MB, 2)

        if ($backupSize -eq $dbSize) {
            Write-Host "✓ Backup created successfully!" -ForegroundColor Green
            Write-Host "  Backup size: $backupSizeMB MB" -ForegroundColor Gray
            $backupSuccess = $true
        } else {
            Write-Host "✗ Backup size mismatch!" -ForegroundColor Red
            Write-Host "  Original: $dbSizeMB MB" -ForegroundColor Red
            Write-Host "  Backup: $backupSizeMB MB" -ForegroundColor Red
            $backupSuccess = $false
        }
    } else {
        Write-Host "✗ Backup file not created!" -ForegroundColor Red
        $backupSuccess = $false
    }
} catch {
    Write-Host "✗ Backup failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    $backupSuccess = $false
}

Write-Host ""

# Cleanup old backups
if ($backupSuccess) {
    Write-Host "Cleaning up old backups (retention: $RetentionDays days)..." -ForegroundColor Yellow

    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $oldBackups = Get-ChildItem -Path $BackupPath -Filter "procurement-db-*.db" |
                  Where-Object { $_.LastWriteTime -lt $cutoffDate }

    if ($oldBackups) {
        Write-Host "  Found $($oldBackups.Count) old backup(s) to remove" -ForegroundColor Gray

        foreach ($backup in $oldBackups) {
            Remove-Item -Path $backup.FullName -Force
            Write-Host "  ✓ Removed: $($backup.Name)" -ForegroundColor Gray
        }

        Write-Host "✓ Cleanup completed" -ForegroundColor Green
    } else {
        Write-Host "  No old backups to remove" -ForegroundColor Gray
    }
}

Write-Host ""

# List current backups
Write-Host "Current backups:" -ForegroundColor Yellow
$backups = Get-ChildItem -Path $BackupPath -Filter "procurement-db-*.db" |
           Sort-Object LastWriteTime -Descending |
           Select-Object -First 10

if ($backups) {
    foreach ($backup in $backups) {
        $sizeMB = [math]::Round($backup.Length / 1MB, 2)
        $age = (Get-Date) - $backup.LastWriteTime
        Write-Host "  - $($backup.Name) ($sizeMB MB, $($age.Days) days old)" -ForegroundColor Cyan
    }
} else {
    Write-Host "  No backups found" -ForegroundColor Gray
}

Write-Host ""

# Calculate total backup size
$totalSize = (Get-ChildItem -Path $BackupPath -Filter "procurement-db-*.db" |
              Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "Total backup storage: $totalSizeMB MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
if ($backupSuccess) {
    Write-Host " ✓ Backup Completed Successfully" -ForegroundColor Green
} else {
    Write-Host " ✗ Backup Failed" -ForegroundColor Red
}
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Send email notification (if configured)
if ($AlertEmail -and $env:SMTP_HOST) {
    Write-Host "Sending email notification..." -ForegroundColor Yellow

    $subject = if ($backupSuccess) {
        "✓ Procurement DB Backup Success - $timestamp"
    } else {
        "✗ Procurement DB Backup Failed - $timestamp"
    }

    $body = @"
Procurement System Database Backup Report

Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Status: $(if ($backupSuccess) { 'SUCCESS' } else { 'FAILED' })

Database: $DatabasePath
Backup File: $backupFile
Database Size: $dbSizeMB MB
Total Backups: $($backups.Count)
Total Storage: $totalSizeMB MB
Retention: $RetentionDays days

---
This is an automated message from the Procurement System backup script.
"@

    try {
        $smtpParams = @{
            To = $AlertEmail
            From = $env:SMTP_FROM
            Subject = $subject
            Body = $body
            SmtpServer = $env:SMTP_HOST
            Port = $env:SMTP_PORT
        }

        if ($env:SMTP_USER -and $env:SMTP_PASSWORD) {
            $securePassword = ConvertTo-SecureString $env:SMTP_PASSWORD -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential ($env:SMTP_USER, $securePassword)
            $smtpParams.Credential = $credential
        }

        if ($env:SMTP_SECURE -eq "true") {
            $smtpParams.UseSsl = $true
        }

        Send-MailMessage @smtpParams
        Write-Host "✓ Email notification sent to $AlertEmail" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Failed to send email notification" -ForegroundColor Yellow
        Write-Host "Error: $_" -ForegroundColor Yellow
    }

    Write-Host ""
}

# Exit with appropriate code
if ($backupSuccess) {
    exit 0
} else {
    exit 1
}
