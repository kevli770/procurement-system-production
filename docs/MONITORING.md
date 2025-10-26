# מדריך ניטור ואלרטים - Procurement System

<div dir="rtl">

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [PM2 Monitoring](#pm2-monitoring)
3. [Windows Event Logs](#windows-event-logs)
4. [Email Alerts](#email-alerts)
5. [Performance Metrics](#performance-metrics)
6. [Dashboards](#dashboards)

---

## סקירה כללית

### מה מנוטר?

```
┌────────────────────────────────────────────┐
│ Layer 1: Infrastructure                   │
│ - Windows Services (PM2, IIS)             │
│ - CPU, Memory, Disk                       │
│ - Network connectivity                    │
└────────────┬───────────────────────────────┘
             │
┌────────────▼───────────────────────────────┐
│ Layer 2: Application                      │
│ - PM2 Process health                      │
│ - Instance count & status                 │
│ - Memory per instance                     │
│ - Restart frequency                       │
└────────────┬───────────────────────────────┘
             │
┌────────────▼───────────────────────────────┐
│ Layer 3: Business Logic                   │
│ - Health endpoint (/api/health)           │
│ - Database connectivity                   │
│ - Response times                          │
│ - Error rates                             │
└────────────────────────────────────────────┘
```

---

## PM2 Monitoring

### PM2 Built-in Monitoring

```powershell
# Real-time dashboard
pm2 monit
```

תראה:
- CPU usage per instance
- Memory usage
- Loop delay
- Active handles

### PM2 List - Quick Status

```powershell
pm2 list
```

**מה לבדוק:**
- ✅ Status: כל ה-instances צריכים להיות **online**
- ✅ Restart: אם מספר גבוה (>10) - יש בעיה
- ⚠️ Memory: אם מעל 800MB - צריך חקירה
- ⚠️ CPU: אם מעל 80% ללא עומס - בעיה

### PM2 Describe - מידע מפורט

```powershell
pm2 describe 0
```

מידע חשוב:
- Uptime
- Restart count
- Exit code (אם נפל)
- Environment variables
- Path to logs

### PM2 Plus (Cloud Monitoring)

#### הרשמה והתקנה

1. הרשם ב: https://app.pm2.io
2. צור Organization: "Procurement System"
3. קבל keys:
   - PM2_PUBLIC_KEY
   - PM2_SECRET_KEY

4. הוסף ל-`.env`:
```env
PM2_PUBLIC_KEY="xxxxxxxxxxxxx"
PM2_SECRET_KEY="xxxxxxxxxxxxx"
```

5. Restart PM2:
```powershell
pm2 kill
Restart-Service -Name "PM2"
Start-Sleep -Seconds 10
pm2 resurrect
```

#### תכונות PM2 Plus

- 📊 Real-time metrics
- 🔔 Email/Slack alerts
- 📈 Historical data (30 days)
- 🔍 Log streaming
- 🎯 Custom metrics
- 📱 Mobile app

**Dashboard:** https://app.pm2.io

---

## Windows Event Logs

### הפעלת Logging

PM2 Service כותב ל-Event Viewer:

1. פתח **Event Viewer** (eventvwr.msc)
2. נווט ל: **Windows Logs → Application**
3. סנן לפי Source: **PM2**

### Useful Filters

```powershell
# שגיאות PM2 אחרונות
Get-EventLog -LogName Application -Source PM2 -EntryType Error -Newest 20

# אזהרות IIS
Get-EventLog -LogName System -Source "W3SVC" -EntryType Warning -Newest 20

# כל האירועים היום
Get-EventLog -LogName Application -After (Get-Date).Date |
    Where-Object {$_.Source -in @("PM2", "W3SVC")} |
    Select-Object TimeGenerated, Source, EntryType, Message
```

### Automated Event Monitoring

צור Task שבודק אירועים כל שעה:

**PowerShell Script: `check-events.ps1`**
```powershell
$errors = Get-EventLog -LogName Application -Source PM2 `
                       -EntryType Error `
                       -After (Get-Date).AddHours(-1)

if ($errors) {
    # Send alert email
    $body = $errors | Format-List | Out-String
    Send-MailMessage -To "admin@company.com" `
                     -From "server@company.com" `
                     -Subject "PM2 Errors Detected" `
                     -Body $body `
                     -SmtpServer "smtp.company.com"
}
```

---

## Email Alerts

### סקריפט הניטור הקיים

הסקריפט `monitor-services.ps1` כבר תומך באלרטים.

**הפעלה עם אלרטים:**
```powershell
D:\procurement\deployment\monitor-services.ps1 `
    -Once `
    -AlertEmail "admin@your-company.com"
```

### הגדרת Task Scheduler לאלרטים

1. **Task Scheduler** → Create Task

**General:**
- Name: `Procurement Monitoring`
- Run with highest privileges: ✅

**Triggers:**
- Repeat every: **10 minutes**
- Indefinitely: ✅

**Actions:**
- Program: `powershell.exe`
- Arguments:
```
-ExecutionPolicy Bypass -File "D:\procurement\deployment\monitor-services.ps1" -Once -AlertEmail "admin@company.com"
```

### מה מפעיל אלרט?

הסקריפט שולח אלרט אם:
- ✉️ PM2 Service לא רץ
- ✉️ IIS Service לא רץ
- ✉️ אין PM2 instances online
- ✉️ Health endpoint מחזיר שגיאה

### התאמת אלרטים

ערוך את `monitor-services.ps1` להוסיף בדיקות:

```powershell
# דוגמה: אלרט על memory גבוה
if ($healthData.memory.percentage -gt 85) {
    Send-Alert -Subject "High Memory Usage" `
               -Body "Memory: $($healthData.memory.percentage)%"
}

# דוגמה: אלרט על תשובה איטית
if ($healthData.responseTime -gt 1000) {
    Send-Alert -Subject "Slow Response Time" `
               -Body "Response: $($healthData.responseTime)ms"
}
```

---

## Performance Metrics

### Application Metrics

#### Health Endpoint

```powershell
# קבל metrics
$health = Invoke-RestMethod http://localhost:3000/api/health

# הצג
$health | ConvertTo-Json -Depth 3
```

**מה לבדוק:**
- `uptime`: כמה זמן ה-instance רץ
- `memory.percentage`: אם >80% - בעיה
- `responseTime`: אם >500ms - בעיה
- `database`: חייב להיות "connected"

#### Custom Metrics Script

```powershell
# collect-metrics.ps1
$metrics = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    pm2_instances = (pm2 jlist | ConvertFrom-Json).Count
    health = Invoke-RestMethod http://localhost:3000/api/health
    cpu = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    memory_available = (Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue
}

# שמור ל-log
$metrics | ConvertTo-Json | Add-Content "D:\logs\procurement\metrics.log"

# או שלח למערכת monitoring
```

### Infrastructure Metrics

#### CPU Monitoring

```powershell
# CPU usage
Get-Counter '\Processor(_Total)\% Processor Time'

# Per-process
Get-Process node* | Select-Object Name, CPU, @{n='CPU%';e={$_.CPU / (Get-Date - $_.StartTime).TotalSeconds * 100}}
```

#### Memory Monitoring

```powershell
# Available memory
Get-Counter '\Memory\Available MBytes'

# Per-instance
pm2 list
```

#### Disk Monitoring

```powershell
# Disk usage
Get-PSDrive D | Select-Object @{n='Free%';e={($_.Free / ($_.Used + $_.Free)) * 100}}

# Disk I/O
Get-Counter '\PhysicalDisk(D:)\Disk Reads/sec'
Get-Counter '\PhysicalDisk(D:)\Disk Writes/sec'
```

#### Network Monitoring

```powershell
# Active connections to port 3000
netstat -ano | findstr :3000 | Measure-Object

# Network throughput
Get-Counter '\Network Interface(*)\Bytes Total/sec'
```

---

## Dashboards

### Simple PowerShell Dashboard

צור `dashboard.ps1`:

```powershell
function Show-Dashboard {
    Clear-Host
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         Procurement System - Live Dashboard           ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""

    # Services
    Write-Host "━━━ Services ━━━" -ForegroundColor Yellow
    $pm2 = Get-Service -Name "PM2"
    $iis = Get-Service -Name "W3SVC"

    $pm2Color = if($pm2.Status -eq "Running"){"Green"}else{"Red"}
    $iisColor = if($iis.Status -eq "Running"){"Green"}else{"Red"}

    Write-Host "  PM2:  " -NoNewline
    Write-Host $pm2.Status -ForegroundColor $pm2Color
    Write-Host "  IIS:  " -NoNewline
    Write-Host $iis.Status -ForegroundColor $iisColor
    Write-Host ""

    # PM2 Instances
    Write-Host "━━━ PM2 Instances ━━━" -ForegroundColor Yellow
    $instances = pm2 jlist | ConvertFrom-Json
    foreach ($inst in $instances) {
        $status = $inst.pm2_env.status
        $color = if($status -eq "online"){"Green"}else{"Red"}
        $mem = [math]::Round($inst.monit.memory / 1MB, 0)

        Write-Host "  [$($inst.pm_id)] " -NoNewline
        Write-Host "$status" -ForegroundColor $color -NoNewline
        Write-Host " | CPU: $($inst.monit.cpu)% | Mem: $mem MB"
    }
    Write-Host ""

    # Health
    Write-Host "━━━ Application Health ━━━" -ForegroundColor Yellow
    try {
        $health = Invoke-RestMethod http://localhost:3000/api/health -TimeoutSec 5
        Write-Host "  Status:   " -NoNewline
        Write-Host "Healthy ✓" -ForegroundColor Green
        Write-Host "  Uptime:   $([math]::Round($health.uptime / 60, 1)) minutes"
        Write-Host "  Memory:   $($health.memory.used)MB / $($health.memory.total)MB ($($health.memory.percentage)%)"
        Write-Host "  Database: " -NoNewline
        Write-Host $health.database -ForegroundColor Green
    } catch {
        Write-Host "  Status:   " -NoNewline
        Write-Host "Unhealthy ✗" -ForegroundColor Red
    }
    Write-Host ""

    # System Resources
    Write-Host "━━━ System Resources ━━━" -ForegroundColor Yellow
    $cpu = [math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue, 1)
    $memAvail = [math]::Round((Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue, 0)
    $diskD = Get-PSDrive D
    $diskFree = [math]::Round($diskD.Free / 1GB, 1)

    Write-Host "  CPU:    $cpu%"
    Write-Host "  Memory: $memAvail MB available"
    Write-Host "  Disk D: $diskFree GB free"
    Write-Host ""

    Write-Host "Press Ctrl+C to exit" -ForegroundColor Gray
}

# Main loop
while ($true) {
    Show-Dashboard
    Start-Sleep -Seconds 5
}
```

**הפעלה:**
```powershell
D:\procurement\deployment\dashboard.ps1
```

### Web Dashboard (Advanced)

להתקנה של dashboard מבוסס-web, שקול:

1. **PM2 Plus** (ראה למעלה)
2. **Grafana + Prometheus** (מתקדם)
3. **Custom Next.js Admin Page** (ניתן לפתח)

---

## Alert Thresholds - המלצות

### Critical (שלח מייל מיד)

- ❗ PM2/IIS Service down
- ❗ All instances crashed
- ❗ Database disconnected
- ❗ Disk space < 5%
- ❗ Memory > 95%

### Warning (בדוק תוך שעה)

- ⚠️ Instance restart count > 5/hour
- ⚠️ Memory > 80%
- ⚠️ CPU > 80% for 5+ minutes
- ⚠️ Response time > 2 seconds
- ⚠️ Disk space < 20%

### Info (סקור יומי)

- ℹ️ New user created
- ℹ️ Failed login attempts > 10
- ℹ️ Large PO created (>100K)

---

## Monitoring Checklist

### יומי (5 דקות)
- [ ] `pm2 list` - כל ה-instances online?
- [ ] `curl http://localhost:3000/api/health` - healthy?
- [ ] Event Viewer - שגיאות חדשות?
- [ ] Disk space - מספיק פנוי?

### שבועי (15 דקות)
- [ ] PM2 Plus dashboard - אין anomalies?
- [ ] Logs review - דפוסים לא רגילים?
- [ ] Performance metrics - degradation?
- [ ] Backup verification - עובד?

### חודשי (30 דקות)
- [ ] Trend analysis - גידול בשימוש?
- [ ] Capacity planning - צריך upgrade?
- [ ] Alert tuning - false positives?
- [ ] Documentation update

---

## נספח: Sample Alert Email

```
Subject: [CRITICAL] Procurement System Health Alert

Procurement System Health Check Alert

Timestamp: 2025-10-21 14:30:15
Server: PROCUREMENT-SRV-01

Issues Detected (2):
- PM2 service is Stopped
- Application health check failed

Service Status:
- PM2: Stopped
- IIS (W3SVC): Running

Recommended Actions:
1. Check PM2 service: Get-Service -Name "PM2"
2. Check Event Viewer for errors
3. Attempt service restart: Start-Service -Name "PM2"
4. Review logs: pm2 logs --err

---
This is an automated alert from the Procurement System monitoring script.
For assistance, contact IT Support.
```

---

</div>
