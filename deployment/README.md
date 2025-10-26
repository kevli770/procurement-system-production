# Deployment Package - Procurement System

## תוכן התיקייה

```
deployment/
├── README.md                      # המסמך הזה
├── DEPLOYMENT-GUIDE-HE.md         # 📘 מדריך התקנה מלא בעברית
├── ecosystem.config.js            # PM2 configuration
├── web.config                     # IIS configuration
├── .env.production                # Environment variables template
├── install-pm2-service.ps1        # התקנת PM2 Windows Service
├── setup-iis.ps1                  # הגדרת IIS אוטומטית
├── backup-database.ps1            # סקריפט גיבוי DB
└── monitor-services.ps1           # סקריפט ניטור + alerts
```

## Quick Start

### 1. קרא את המדריך המלא

**📘 [DEPLOYMENT-GUIDE-HE.md](./DEPLOYMENT-GUIDE-HE.md)** - מדריך צעד-אחר-צעד בעברית

המדריך כולל:
- התקנת Node.js 20.x LTS
- הכנת האפליקציה
- התקנת PM2 Windows Service
- הגדרת IIS Reverse Proxy
- בדיקות ואימותים
- גיבויים וניטור
- פתרון בעיות

### 2. Prerequisites Checklist

לפני שמתחילים:
- [ ] Windows Server 2019 (או חדש יותר)
- [ ] גישת Administrator
- [ ] IIS מותקן
- [ ] כונן D:\ עם 10GB+ פנויים
- [ ] חיבור לאינטרנט
- [ ] פרטי SMTP server

### 3. סדר הפעולות

```powershell
# 1. התקן Node.js 20.x LTS
# הורד מ: https://nodejs.org/

# 2. העתק קבצי האפליקציה ל-D:\procurement

# 3. הרץ התקנת PM2
.\deployment\install-pm2-service.ps1

# 4. הרץ הגדרת IIS
.\deployment\setup-iis.ps1

# 5. בדוק שהכל עובד
pm2 list
curl http://procurementapp/api/health
```

### 4. תיעוד נוסף

- **[docs/MAINTENANCE.md](../docs/MAINTENANCE.md)** - תחזוקה שוטפת
- **[docs/MONITORING.md](../docs/MONITORING.md)** - ניטור ואלרטים

---

## קבצי Configuration

### ecosystem.config.js

הגדרות PM2:
- **3 instances** (cluster mode)
- Auto-restart on crash
- Memory limit: 1GB per instance
- Logging: D:\logs\procurement\

### web.config

הגדרות IIS:
- Reverse proxy → localhost:3000
- Security headers
- Error handling
- SSL ready (commented)

### .env.production

**חשוב!** ערוך לפני שימוש:
- `NEXTAUTH_SECRET` - צור secret חדש!
- `ENCRYPTION_KEY` - צור key חדש!
- `SMTP_*` - הגדרות SMTP שלכם
- `NEXTAUTH_URL` - עדכן לפי domain

---

## PowerShell Scripts

### install-pm2-service.ps1

מתקין PM2 כ-Windows Service עם:
- ✅ Automatic startup
- ✅ Recovery on failure
- ✅ Service name: "PM2"

**שימוש:**
```powershell
.\install-pm2-service.ps1
```

### setup-iis.ps1

מגדיר IIS כ-Reverse Proxy:
- ✅ Application Pool creation
- ✅ Website creation
- ✅ web.config deployment
- ✅ ARR proxy enable

**שימוש:**
```powershell
.\setup-iis.ps1
```

### backup-database.ps1

גיבוי אוטומטי של SQLite DB:
- ✅ Timestamp-based backups
- ✅ Retention policy (30 days)
- ✅ Email notifications
- ✅ Integrity verification

**שימוש ידני:**
```powershell
.\backup-database.ps1

# עם email alert
.\backup-database.ps1 -AlertEmail "admin@company.com"

# Custom retention
.\backup-database.ps1 -RetentionDays 60
```

**תזמון (Task Scheduler):**
- תדירות: יומי בשעה 2:00
- ראה מדריך התקנה לפרטים

### monitor-services.ps1

ניטור בריאות המערכת:
- ✅ PM2 & IIS services
- ✅ PM2 instances
- ✅ Health endpoint
- ✅ Email alerts on issues

**שימוש:**
```powershell
# בדיקה חד-פעמית
.\monitor-services.ps1 -Once

# עם email alerts
.\monitor-services.ps1 -Once -AlertEmail "admin@company.com"

# Continuous monitoring (Ctrl+C לעצירה)
.\monitor-services.ps1 -CheckInterval 60
```

**תזמון (Task Scheduler):**
- תדירות: כל 10 דקות
- ראה מדריך התקנה לפרטים

---

## ארכיטקטורה

```
┌──────────────────────────────────────────┐
│ Client (Browser)                         │
│ http://procurementapp                    │
└────────────┬─────────────────────────────┘
             │
             │ Port 80/443
             ▼
┌────────────────────────────────────────────┐
│ IIS (Reverse Proxy)                        │
│ - SSL/TLS termination                      │
│ - Security headers                         │
│ - Health checks                            │
└────────────┬───────────────────────────────┘
             │
             │ http://localhost:3000
             ▼
┌────────────────────────────────────────────┐
│ PM2 Windows Service                        │
│ ┌────────────┬────────────┬─────────────┐ │
│ │Instance #1 │Instance #2 │Instance #3  │ │
│ │  Next.js   │  Next.js   │  Next.js    │ │
│ │  Port:3000 │  Port:3000 │  Port:3000  │ │
│ └────────────┴────────────┴─────────────┘ │
│ - Auto-restart on crash                    │
│ - Auto-start on boot                       │
│ - Load balancing                           │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ SQLite Database                            │
│ D:\procurement\prisma\procurement.db       │
└────────────────────────────────────────────┘
```

---

## Resource Requirements

### Hardware (Production)

- **CPU:** 4 cores minimum
- **RAM:** 16GB minimum (8GB available)
- **Disk:** 20GB minimum (D: drive)
  - Application: ~5GB
  - Database: ~1-5GB (grows)
  - Logs: ~2GB
  - Backups: ~10GB (30 days retention)

### Software

- **OS:** Windows Server 2019 or newer
- **Node.js:** 20.x LTS
- **IIS:** 10.0+
- **IIS Modules:**
  - Application Request Routing (ARR)
  - URL Rewrite Module

---

## Port Usage

- **80** - HTTP (IIS)
- **443** - HTTPS (IIS, future)
- **3000** - Next.js (localhost only)
- **5555** - Prisma Studio (optional, dev only)

---

## Security Considerations

### Applied by Default

- ✅ No Managed Code (IIS App Pool)
- ✅ Security headers (X-Frame-Options, etc.)
- ✅ .env file permissions restricted
- ✅ PM2 runs as Local System
- ✅ Database file access controlled

### Manual Configuration Needed

- [ ] Firewall rules (if internet-facing)
- [ ] SSL/TLS certificates (for HTTPS)
- [ ] AD integration (if needed)
- [ ] Network security groups
- [ ] Antivirus exclusions (if needed)

---

## Troubleshooting Quick Reference

### PM2 Service not starting

```powershell
# Check service status
Get-Service -Name "PM2"

# Check Event Viewer
Get-EventLog -LogName Application -Source PM2 -Newest 10

# Manual start
Start-Service -Name "PM2"
```

### IIS returns 502 Bad Gateway

```powershell
# Verify PM2 is running
pm2 list

# Test backend directly
curl http://localhost:3000/api/health

# Check ARR proxy is enabled
# IIS Manager → Server → Application Request Routing
```

### Application not accessible

```powershell
# Check all services
Get-Service -Name "PM2", "W3SVC"

# Check bindings
Get-Website | Select-Object Name, State, Bindings

# Check hosts file
Get-Content C:\Windows\System32\drivers\etc\hosts
```

---

## Support

For detailed troubleshooting, see:
- [DEPLOYMENT-GUIDE-HE.md](./DEPLOYMENT-GUIDE-HE.md) - פתרון בעיות מפורט
- [../docs/MAINTENANCE.md](../docs/MAINTENANCE.md) - תחזוקה
- [../docs/MONITORING.md](../docs/MONITORING.md) - ניטור

---

## License & Contact

**Procurement System**
Version: 0.1.0
Environment: Production
Deployment Type: Windows Server 2019 + IIS + PM2

For questions or issues, contact your system administrator.

---

**Last Updated:** 2025-10-21
