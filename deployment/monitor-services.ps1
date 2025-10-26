# ================================================================
# Services Monitoring Script
# Procurement System - Health Monitoring & Alerts
# ================================================================
#
# This script monitors PM2, IIS, and application health
# Sends email alerts if issues are detected
#
# Usage:
#   .\monitor-services.ps1
#
# Scheduling:
#   Run every 5-10 minutes via Task Scheduler
#
# ================================================================

param(
    [string]$AlertEmail = "",  # Email for alerts
    [int]$CheckInterval = 60,  # Seconds between checks (for continuous mode)
    [switch]$Once = $false     # Run once and exit
)

# Load environment variables
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

function Send-Alert {
    param(
        [string]$Subject,
        [string]$Body
    )

    if (-not $AlertEmail -or -not $env:SMTP_HOST) {
        return
    }

    try {
        $smtpParams = @{
            To = $AlertEmail
            From = $env:SMTP_FROM
            Subject = "[ALERT] $Subject"
            Body = $Body
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
        Write-Host "   ✓ Alert sent: $Subject" -ForegroundColor Yellow
    } catch {
        Write-Host "   ✗ Failed to send alert: $_" -ForegroundColor Red
    }
}

function Test-ServiceHealth {
    $issues = @()
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host " Service Health Check - $timestamp" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Check PM2 Service
    Write-Host "[1/4] Checking PM2 Service..." -ForegroundColor Yellow
    $pm2Service = Get-Service -Name "PM2" -ErrorAction SilentlyContinue

    if (-not $pm2Service) {
        $issue = "PM2 service not found!"
        Write-Host "   ✗ $issue" -ForegroundColor Red
        $issues += $issue
    } elseif ($pm2Service.Status -ne "Running") {
        $issue = "PM2 service is $($pm2Service.Status)"
        Write-Host "   ✗ $issue" -ForegroundColor Red
        $issues += $issue

        # Attempt to start
        Write-Host "   Attempting to start PM2 service..." -ForegroundColor Yellow
        try {
            Start-Service -Name "PM2"
            Start-Sleep -Seconds 5
            $pm2Service = Get-Service -Name "PM2"
            if ($pm2Service.Status -eq "Running") {
                Write-Host "   ✓ PM2 service started successfully" -ForegroundColor Green
            }
        } catch {
            Write-Host "   ✗ Failed to start PM2 service: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✓ PM2 service is running" -ForegroundColor Green
    }

    Write-Host ""

    # Check IIS Service
    Write-Host "[2/4] Checking IIS Service (W3SVC)..." -ForegroundColor Yellow
    $iisService = Get-Service -Name "W3SVC" -ErrorAction SilentlyContinue

    if (-not $iisService) {
        $issue = "IIS service (W3SVC) not found!"
        Write-Host "   ✗ $issue" -ForegroundColor Red
        $issues += $issue
    } elseif ($iisService.Status -ne "Running") {
        $issue = "IIS service is $($iisService.Status)"
        Write-Host "   ✗ $issue" -ForegroundColor Red
        $issues += $issue

        # Attempt to start
        Write-Host "   Attempting to start IIS service..." -ForegroundColor Yellow
        try {
            Start-Service -Name "W3SVC"
            Start-Sleep -Seconds 3
            $iisService = Get-Service -Name "W3SVC"
            if ($iisService.Status -eq "Running") {
                Write-Host "   ✓ IIS service started successfully" -ForegroundColor Green
            }
        } catch {
            Write-Host "   ✗ Failed to start IIS service: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✓ IIS service is running" -ForegroundColor Green
    }

    Write-Host ""

    # Check PM2 Processes
    Write-Host "[3/4] Checking PM2 Processes..." -ForegroundColor Yellow
    try {
        $pm2List = pm2 jlist 2>&1 | ConvertFrom-Json
        $runningApps = $pm2List | Where-Object { $_.pm2_env.status -eq "online" }

        if ($runningApps) {
            Write-Host "   ✓ Found $($runningApps.Count) running instance(s)" -ForegroundColor Green
            foreach ($app in $runningApps) {
                $memMB = [math]::Round($app.monit.memory / 1MB, 0)
                $cpu = $app.monit.cpu
                Write-Host "      - $($app.name) (PID: $($app.pid), Memory: $memMB MB, CPU: $cpu%)" -ForegroundColor Gray
            }
        } else {
            $issue = "No PM2 processes are online!"
            Write-Host "   ✗ $issue" -ForegroundColor Red
            $issues += $issue

            # Attempt to start
            Write-Host "   Attempting to resurrect PM2 processes..." -ForegroundColor Yellow
            try {
                pm2 resurrect
                Start-Sleep -Seconds 10
                $pm2List = pm2 jlist | ConvertFrom-Json
                $runningApps = $pm2List | Where-Object { $_.pm2_env.status -eq "online" }
                if ($runningApps) {
                    Write-Host "   ✓ Processes started: $($runningApps.Count)" -ForegroundColor Green
                }
            } catch {
                Write-Host "   ✗ Failed to start processes: $_" -ForegroundColor Red
            }
        }
    } catch {
        $issue = "Failed to query PM2 status"
        Write-Host "   ✗ $issue" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $issues += $issue
    }

    Write-Host ""

    # Check Application Health Endpoint
    Write-Host "[4/4] Checking Application Health..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" `
                                      -TimeoutSec 10 `
                                      -UseBasicParsing `
                                      -ErrorAction Stop

        if ($response.StatusCode -eq 200) {
            $healthData = $response.Content | ConvertFrom-Json
            Write-Host "   ✓ Application is healthy" -ForegroundColor Green
            Write-Host "      - Status: $($healthData.status)" -ForegroundColor Gray
            Write-Host "      - Uptime: $([math]::Round($healthData.uptime / 60, 1)) minutes" -ForegroundColor Gray
            if ($healthData.memory) {
                Write-Host "      - Memory: $($healthData.memory.used)MB / $($healthData.memory.total)MB ($($healthData.memory.percentage)%)" -ForegroundColor Gray
            }
        } else {
            $issue = "Health check returned status code: $($response.StatusCode)"
            Write-Host "   ✗ $issue" -ForegroundColor Red
            $issues += $issue
        }
    } catch {
        $issue = "Application health check failed"
        Write-Host "   ✗ $issue" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $issues += $issue
    }

    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan

    # Summary
    if ($issues.Count -eq 0) {
        Write-Host " ✓ All checks passed" -ForegroundColor Green
    } else {
        Write-Host " ✗ Found $($issues.Count) issue(s)" -ForegroundColor Red
        Write-Host "================================================================" -ForegroundColor Cyan

        # Send alert email
        if ($AlertEmail) {
            $alertBody = @"
Procurement System Health Check Alert

Timestamp: $timestamp
Server: $env:COMPUTERNAME

Issues Detected:
$($issues | ForEach-Object { "- $_" } | Out-String)

Service Status:
- PM2: $($pm2Service.Status)
- IIS (W3SVC): $($iisService.Status)

Please investigate immediately.

---
This is an automated alert from the Procurement System monitoring script.
"@

            Send-Alert -Subject "Procurement System - $($issues.Count) Issue(s) Detected" `
                      -Body $alertBody
        }
    }

    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""

    return ($issues.Count -eq 0)
}

# Main execution
if ($Once) {
    # Run once and exit
    $healthy = Test-ServiceHealth
    exit $(if ($healthy) { 0 } else { 1 })
} else {
    # Continuous monitoring mode
    Write-Host "Starting continuous monitoring (Interval: $CheckInterval seconds)" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""

    while ($true) {
        Test-ServiceHealth
        Start-Sleep -Seconds $CheckInterval
    }
}
