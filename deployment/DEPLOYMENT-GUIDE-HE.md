# מדריך התקנה - מערכת Procurement
## Windows Server 2019 + IIS + PM2 + Next.js

<div dir="rtl">

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [דרישות מקדימות](#דרישות-מקדימות)
3. [חלק 1: התקנת Node.js](#חלק-1-התקנת-nodejs)
4. [חלק 2: הכנת האפליקציה](#חלק-2-הכנת-האפליקציה)
5. [חלק 3: התקנת PM2 Windows Service](#חלק-3-התקנת-pm2-windows-service)
6. [חלק 4: הגדרת IIS Reverse Proxy](#חלק-4-הגדרת-iis-reverse-proxy)
7. [חלק 5: הגדרות אבטחה](#חלק-5-הגדרות-אבטחה)
8. [חלק 6: בדיקות ואימותים](#חלק-6-בדיקות-ואימותים)
9. [חלק 7: גיבויים וניטור](#חלק-7-גיבויים-וניטור)
10. [פתרון בעיות](#פתרון-בעיות)

---

## סקירה כללית

### מה מותקן במערכת?

```
┌─────────────────────────────────────────┐
│ Windows Server 2019                     │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ IIS (Reverse Proxy)            │    │
│  │ Port: 80/443                   │    │
│  │ Domain: procurementapp         │    │
│  └──────────┬─────────────────────┘    │
│             │                           │
│  ┌──────────▼─────────────────────┐    │
│  │ PM2 Windows Service            │    │
│  │ - 3 Next.js instances          │    │
│  │ - Auto-restart on crash        │    │
│  │ - Auto-start on boot           │    │
│  │ Port: 3000                     │    │
│  └──────────┬─────────────────────┘    │
│             │                           │
│  ┌──────────▼─────────────────────┐    │
│  │ SQLite Database                │    │
│  │ Location: D:\procurement\      │    │
│  │           prisma\procurement.db│    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### מבנה תיקיות

```
D:\procurement\                    # אפליקציה ראשית
├── .next\                        # Build output
├── node_modules\                 # Dependencies
├── prisma\
│   └── procurement.db            # Database
├── public\                       # Static files
├── src\                         # Source code
├── .env                         # Environment variables
├── ecosystem.config.js          # PM2 configuration
├── package.json
└── next.config.ts

D:\logs\procurement\              # לוגים
├── pm2-err.log
├── pm2-out.log
└── app.log

D:\backups\procurement\           # גיבויים
└── procurement-db-YYYYMMDD-HHMMSS.db
```

---

## דרישות מקדימות

### ✅ Checklist לפני התחלה

- [ ] Windows Server 2019 (או גרסה חדשה יותר)
- [ ] גישת Administrator לשרת
- [ ] IIS מותקן ופועל
- [ ] כונן D:\ עם לפחות 10GB פנויים
- [ ] חיבור לאינטרנט (להתקנת תוכנות)
- [ ] גישה ל-SMTP server (לשליחת מיילים)

### תוכנות שיותקנו במהלך ההתקנה

1. **Node.js 20.x LTS** - Runtime סביבה ל-Next.js
2. **PM2** - Process manager ל-Node.js
3. **PM2 Windows Service** - Service wrapper ל-PM2
4. **IIS ARR Module** - Application Request Routing
5. **IIS URL Rewrite Module** - URL Rewriting

---

## חלק 1: התקנת Node.js

### שלב 1.1: הורדת Node.js

1. פתח דפדפן ועבור לכתובת: https://nodejs.org/
2. בחר ב-**LTS (Long Term Support)** - גרסה 20.x
3. הורד את **Windows Installer (.msi)** 64-bit

   **קישור ישיר:** https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi

### שלב 1.2: התקנת Node.js

1. הרץ את הקובץ `node-v20.18.0-x64.msi`
2. בעקוב אחר האשף:
   - ✅ Accept the license agreement
   - ✅ בחר path התקנה ברירת מחדל: `C:\Program Files\nodejs\`
   - ✅ **חשוב:** וודא שמסומן **"Add to PATH"**
   - ✅ בחר להתקין גם **npm package manager**
   - ✅ בחר להתקין גם **Tools for Native Modules** (אופציונלי אבל מומלץ)
3. לחץ **Install**

### שלב 1.3: אימות התקנה

פתח **PowerShell** כ-Administrator והרץ:

```powershell
# בדיקת Node.js
node --version
# תוצאה צפויה: v20.18.0 (או גרסה דומה)

# בדיקת npm
npm --version
# תוצאה צפויה: 10.x.x
```

אם אתה רואה את הגרסאות - ההתקנה הצליחה! ✅

---

## חלק 2: הכנת האפליקציה

### שלב 2.1: יצירת מבנה תיקיות

פתח PowerShell כ-Administrator:

```powershell
# יצירת תיקייה ראשית
New-Item -Path "D:\procurement" -ItemType Directory -Force

# יצירת תיקיית לוגים
New-Item -Path "D:\logs\procurement" -ItemType Directory -Force

# יצירת תיקיית גיבויים
New-Item -Path "D:\backups\procurement" -ItemType Directory -Force

# אישור יצירה
Get-ChildItem D:\ -Directory | Where-Object { $_.Name -in @("procurement", "logs", "backups") }
```

### שלב 2.2: העתקת קבצי האפליקציה

אם קיבלת את הקבצים כ-ZIP או מ-Git:

**אופציה A: מ-ZIP**
1. חלץ את התיקייה `procurement` לכונן D:\
2. וודא שכל הקבצים נמצאים ב-`D:\procurement\`

**אופציה B: מ-Git Repository**
```powershell
cd D:\

# Clone the repository
git clone <repository-url> procurement

cd procurement
```

### שלב 2.3: התקנת Dependencies

```powershell
cd D:\procurement

# התקנת כל החבילות הנדרשות
npm install

# הפעלה זו יכולה לקחת 5-10 דקות
# תראה הודעות על התקנת מאות חבילות - זה תקין
```

### שלב 2.4: הגדרת Environment Variables

1. העתק את הקובץ לסביבת production:
```powershell
Copy-Item -Path "D:\procurement\deployment\.env.production" -Destination "D:\procurement\.env"
```

2. ערוך את הקובץ `.env` ב-Notepad:
```powershell
notepad D:\procurement\.env
```

3. **חשוב מאוד!** עדכן את הערכים הבאים:

```env
# יצירת secret חדש (הרץ ב-PowerShell):
# -d 32 | ForEach-Object { -join ((65..90) + (97..122) + (48..57) | Get-Random -Count $_ | ForEach-Object {[char]$_}) }
NEXTAUTH_SECRET="השתמש בפקודה למעלה ליצירת string אקראי"

# עדכן לפי ה-domain שלך
NEXTAUTH_URL="http://procurementapp"
NEXT_PUBLIC_APP_URL="http://procurementapp"

# הגדרות SMTP - עדכן לפי ה-SMTP server שלכם
SMTP_HOST="smtp.your-company.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="procurement@your-company.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="procurement@your-company.com"

# יצירת encryption key (הרץ ב-PowerShell):
# -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
ENCRYPTION_KEY="השתמש בפקודה למעלה ליצירת hex string"
```

4. שמור את הקובץ (Ctrl+S) וסגור

### שלב 2.5: Setup Database

```powershell
cd D:\procurement

# יצירת Prisma Client
npm run prisma:generate

# הרצת migrations (יצירת טבלאות)
npx prisma migrate deploy

# Seed נתונים ראשוניים
npm run prisma:seed
```

תראה הודעות על יצירת טבלאות ומשתמש ראשוני.

### שלב 2.6: Build האפליקציה

```powershell
cd D:\procurement

# Build לייצור (זה ייקח 3-5 דקות)
npm run build
```

תראה output דומה ל:
```
✓ Compiled successfully
✓ Creating optimized production build
✓ Generating static pages
```

אם יש שגיאות - **עצור כאן** ופנה לסעיף [פתרון בעיות](#פתרון-בעיות).

✅ **Checkpoint:** אם ה-build הצליח, האפליקציה מוכנה!

---

## חלק 3: התקנת PM2 Windows Service

### שלב 3.1: התקנה אוטומטית (מומלץ)

השתמש בסקריפט המוכן:

```powershell
cd D:\procurement\deployment

# הרצת סקריפט ההתקנה
.\install-pm2-service.ps1
```

הסקריפט יבצע:
1. ✅ התקנת PM2 globally
2. ✅ התקנת pm2-windows-service
3. ✅ יצירת Windows Service בשם "PM2"
4. ✅ הגדרת Startup Type: Automatic
5. ✅ הגדרת Recovery Options

### שלב 3.2: התקנה ידנית (אם הסקריפט נכשל)

```powershell
# התקנת PM2
npm install -g pm2

# בדיקה
pm2 --version

# התקנת PM2 Windows Service
npm install -g pm2-windows-service

# יצירת Service
pm2-service-install -n PM2

# הגדרת recovery options
sc.exe failure PM2 reset= 86400 actions= restart/5000/restart/10000/restart/30000
```

### שלב 3.3: העתקת ecosystem.config.js

```powershell
# העתקת קובץ ההגדרות
Copy-Item -Path "D:\procurement\deployment\ecosystem.config.js" `
          -Destination "D:\procurement\ecosystem.config.js"
```

### שלב 3.4: הפעלת האפליקציה ב-PM2

```powershell
cd D:\procurement

# הפעלת האפליקציה עם ההגדרות
pm2 start ecosystem.config.js

# המתן 10 שניות שהכל יעלה
Start-Sleep -Seconds 10

# בדיקת סטטוס
pm2 list
```

אמור להיראות כך:
```
┌─────┬────────────────────┬─────────┬─────┬────────┐
│ id  │ name               │ status  │ cpu │ memory │
├─────┼────────────────────┼─────────┼─────┼────────┤
│ 0   │ procurement-system │ online  │ 0%  │ 150 MB │
│ 1   │ procurement-system │ online  │ 0%  │ 150 MB │
│ 2   │ procurement-system │ online  │ 0%  │ 150 MB │
└─────┴────────────────────┴─────────┴─────┴────────┘
```

### שלב 3.5: שמירת הגדרות PM2

**חשוב מאוד!** שמור את ההגדרות כדי שיעלו אוטומטית אחרי restart:

```powershell
pm2 save
```

תראה הודעה:
```
[PM2] Saving current process list...
[PM2] Successfully saved in C:\...\.pm2\dump.pm2
```

### שלב 3.6: בדיקת Health Check

```powershell
# בדיקה ישירה של האפליקציה
curl http://localhost:3000/api/health
```

אמור להחזיר JSON עם:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "memory": {...},
  "database": "connected"
}
```

✅ **Checkpoint:** אם אתה רואה 3 instances online - PM2 עובד מצוין!

---

## חלק 4: הגדרת IIS Reverse Proxy

### שלב 4.1: וידוא שIIS מותקן

```powershell
# בדיקת IIS
Get-Service -Name "W3SVC"
```

אם IIS לא מותקן, התקן דרך Server Manager:
1. Server Manager → Add Roles and Features
2. בחר: Web Server (IIS)
3. בחר גם: Management Tools

### שלב 4.2: התקנת Modules הנדרשים

צריך להתקין 2 modules:

**A. Application Request Routing (ARR)**
1. הורד מ: https://www.iis.net/downloads/microsoft/application-request-routing
2. או קישור ישיר: https://download.microsoft.com/download/E/9/8/E9849D6A-020E-47E4-9FD0-A023E99B54EB/requestRouter_amd64.msi
3. הרץ את ה-installer
4. Restart IIS: `iisreset`

**B. URL Rewrite Module**
1. הורד מ: https://www.iis.net/downloads/microsoft/url-rewrite
2. או קישור ישיר: https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi
3. הרץ את ה-installer
4. Restart IIS: `iisreset`

### שלב 4.3: הרצת Setup Script (מומלץ)

```powershell
cd D:\procurement\deployment

# הרצת סקריפט הגדרת IIS
.\setup-iis.ps1
```

הסקריפט יבצע:
1. ✅ בדיקת IIS ו-Modules
2. ✅ יצירת Application Pool
3. ✅ יצירת Website
4. ✅ העתקת web.config
5. ✅ הפעלת ARR Proxy

### שלב 4.4: הגדרה ידנית (אם הסקריפט נכשל)

**A. יצירת Application Pool:**

1. פתח **IIS Manager** (inetmgr)
2. לחץ ימני על **Application Pools** → **Add Application Pool**
   - Name: `ProcurementAppPool`
   - .NET CLR version: **No Managed Code**
   - Managed pipeline mode: Integrated
   - Start application pool immediately: ✅
3. לחץ ימני על `ProcurementAppPool` → **Advanced Settings**
   - Start Mode: **AlwaysRunning**
   - Idle Timeout (minutes): **0** (disable)

**B. יצירת Website:**

1. ב-IIS Manager, לחץ ימני על **Sites** → **Add Website**
   - Site name: `Procurement`
   - Application pool: `ProcurementAppPool`
   - Physical path: `D:\procurement\public`
   - Binding:
     - Type: http
     - IP address: All Unassigned
     - Port: 80
     - Host name: `procurementapp`
2. לחץ **OK**

**C. העתקת web.config:**

```powershell
# יצירת תיקייה אם לא קיימת
New-Item -Path "D:\procurement\public" -ItemType Directory -Force

# העתקת web.config
Copy-Item -Path "D:\procurement\deployment\web.config" `
          -Destination "D:\procurement\public\web.config"
```

**D. הפעלת ARR Proxy:**

1. ב-IIS Manager, לחץ על שם השרת (root level)
2. פתח **Application Request Routing Cache**
3. בצד ימין, לחץ **Server Proxy Settings**
4. ✅ סמן **Enable proxy**
5. לחץ **Apply**

### שלב 4.5: הגדרת DNS/Hosts Entry

כדי שהשרת יזהה את `procurementapp`:

```powershell
# עריכת hosts file
notepad C:\Windows\System32\drivers\etc\hosts
```

הוסף שורה (החלף ב-IP של השרת):
```
192.168.1.100    procurementapp
```

שמור וסגור.

### שלב 4.6: בדיקת IIS

```powershell
# בדיקה דרך IIS
curl http://procurementapp/api/health
```

אמור להחזיר אותו JSON כמו בשלב 3.6.

✅ **Checkpoint:** אם אתה מקבל תשובה מ-`http://procurementapp` - IIS עובד!

---

## חלק 5: הגדרות אבטחה

### שלב 5.1: Firewall Rules

אם השרת פתוח לרשת:

```powershell
# פתיחת Port 80 (HTTP)
New-NetFirewallRule -DisplayName "Procurement HTTP" `
                    -Direction Inbound `
                    -Protocol TCP `
                    -LocalPort 80 `
                    -Action Allow

# לעתיד - Port 443 (HTTPS)
# New-NetFirewallRule -DisplayName "Procurement HTTPS" `
#                     -Direction Inbound `
#                     -Protocol TCP `
#                     -LocalPort 443 `
#                     -Action Allow
```

### שלב 5.2: הרשאות תיקיות

וודא ש-IIS Application Pool יכול לקרוא קבצים:

```powershell
# הוספת הרשאות ל-Application Pool Identity
$acl = Get-Acl "D:\procurement"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "IIS AppPool\ProcurementAppPool",
    "ReadAndExecute",
    "ContainerInherit,ObjectInherit",
    "None",
    "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl "D:\procurement" $acl
```

### שלב 5.3: הצפנת Secrets

וודא ש-`.env` מוגן:

```powershell
# הסרת הרשאות inheritance
icacls "D:\procurement\.env" /inheritance:r

# מתן גישה רק ל-Administrators ו-SYSTEM
icacls "D:\procurement\.env" /grant:r "Administrators:F"
icacls "D:\procurement\.env" /grant:r "SYSTEM:F"
```

---

## חלק 6: בדיקות ואימותים

### שלב 6.1: בדיקת Services

```powershell
# בדיקת PM2
Get-Service -Name "PM2"
# Status צריך להיות: Running

# בדיקת IIS
Get-Service -Name "W3SVC"
# Status צריך להיות: Running

# בדיקת PM2 processes
pm2 list
# צריך להראות 3 instances online
```

### שלב 6.2: בדיקת Health Endpoint

```powershell
# בדיקה ישירה (דרך PM2)
curl http://localhost:3000/api/health

# בדיקה דרך IIS
curl http://procurementapp/api/health
```

שניהם צריכים להחזיר JSON עם `"status": "healthy"`.

### שלב 6.3: בדיקת Database

```powershell
cd D:\procurement

# פתיחת Prisma Studio (UI לניהול DB)
npx prisma studio
```

דפדפן ייפתח עם http://localhost:5555
וודא שאתה רואה טבלאות ונתונים.

### שלב 6.4: בדיקת Login

1. פתח דפדפן ועבור ל: `http://procurementapp`
2. צריך להיות redirect ל-`/login`
3. התחבר עם המשתמש שנוצר ב-seed:
   - Email: המשתמש מה-seed.ts
   - Password: הסיסמה מה-seed.ts

### שלב 6.5: בדיקת Auto-Restart

```powershell
# הרג instance אחד
pm2 stop 0

# המתן 5 שניות
Start-Sleep -Seconds 5

# בדוק - אמור לעלות אוטומטית
pm2 list
```

### שלב 6.6: בדיקת Server Restart

**זהירות:** זה יעשה restart לשרת!

```powershell
# Restart השרת
Restart-Computer -Force
```

אחרי ה-restart:
1. התחבר מחדש לשרת
2. בדוק services:
```powershell
Get-Service -Name "PM2", "W3SVC"
```
3. בדוק PM2:
```powershell
pm2 list
```
4. בדוק אפליקציה:
```powershell
curl http://procurementapp/api/health
```

✅ **Success!** אם הכל עובד אחרי restart - ההתקנה הושלמה!

---

## חלק 7: גיבויים וניטור

### שלב 7.1: הגדרת גיבויים אוטומטיים

**A. בדיקת סקריפט הגיבוי:**

```powershell
# בדיקה ידנית
D:\procurement\deployment\backup-database.ps1
```

**B. תזמון עם Task Scheduler:**

1. פתח **Task Scheduler** (taskschd.msc)
2. לחץ **Create Task** (לא Create Basic Task)

**General Tab:**
- Name: `Procurement DB Backup`
- Description: `Daily backup of Procurement database`
- ✅ Run whether user is logged on or not
- ✅ Run with highest privileges
- Configure for: Windows Server 2019

**Triggers Tab:**
- New → Daily
- Start time: 2:00 AM
- Recur every: 1 day
- ✅ Enabled

**Actions Tab:**
- New → Start a program
- Program/script: `powershell.exe`
- Add arguments:
```
-ExecutionPolicy Bypass -File "D:\procurement\deployment\backup-database.ps1" -AlertEmail "admin@your-company.com"
```

**Conditions Tab:**
- ✅ Start only if the computer is on AC power (uncheck if always on)

**Settings Tab:**
- ✅ Allow task to be run on demand
- ✅ Run task as soon as possible after a scheduled start is missed
- If the task fails, restart every: 10 minutes
- Attempt to restart up to: 3 times

3. לחץ **OK** והזן סיסמת administrator

### שלב 7.2: הגדרת ניטור אוטומטי

**A. תזמון Health Monitoring:**

Task Scheduler → Create Task:

**General Tab:**
- Name: `Procurement Health Monitor`
- ✅ Run whether user is logged on or not
- ✅ Run with highest privileges

**Triggers Tab:**
- New → On a schedule
- Repeat task every: **10 minutes**
- For a duration of: **Indefinitely**
- ✅ Enabled

**Actions Tab:**
- Program/script: `powershell.exe`
- Arguments:
```
-ExecutionPolicy Bypass -File "D:\procurement\deployment\monitor-services.ps1" -Once -AlertEmail "admin@your-company.com"
```

**Settings Tab:**
- Stop the task if it runs longer than: **5 minutes**
- ✅ Run task as soon as possible after a scheduled start is missed

### שלב 7.3: הגדרת PM2 Monitoring Dashboard

אופציונלי - PM2 Plus (cloud monitoring):

1. הרשם ב: https://app.pm2.io
2. צור Organization חדש
3. קבל PM2 Public Key ו-Secret Key
4. הוסף ל-`.env`:
```env
PM2_PUBLIC_KEY="your-public-key"
PM2_SECRET_KEY="your-secret-key"
```
5. Restart PM2:
```powershell
pm2 kill
Restart-Service -Name "PM2"
pm2 resurrect
```

### שלב 7.4: לוגים

**מיקומי לוגים:**
```
D:\logs\procurement\
├── pm2-err.log         # PM2 errors
├── pm2-out.log         # PM2 output
└── app.log             # Application logs (Winston)

C:\inetpub\logs\LogFiles\
└── W3SVC1\              # IIS logs
```

**צפייה בלוגים:**
```powershell
# PM2 logs (real-time)
pm2 logs

# PM2 logs (last 100 lines)
pm2 logs --lines 100

# Application log
Get-Content D:\logs\procurement\app.log -Tail 50

# IIS logs
Get-Content C:\inetpub\logs\LogFiles\W3SVC1\*.log -Tail 50
```

---

## פתרון בעיות

### בעיה: PM2 Service לא עולה אחרי Restart

**תסמינים:**
- Service status: Stopped
- `pm2 list` ריק

**פתרון:**
```powershell
# וידוא שיש dump file
Test-Path $env:USERPROFILE\.pm2\dump.pm2

# אם אין - צור מחדש
pm2 start D:\procurement\ecosystem.config.js
pm2 save

# Restart service
Restart-Service -Name "PM2"
```

---

### בעיה: IIS מחזיר 502 Bad Gateway

**תסמינים:**
- IIS עובד אבל מחזיר 502
- אין תשובה מהאפליקציה

**פתרון:**
```powershell
# 1. וודא ש-PM2 רץ
pm2 list

# 2. בדוק אם PM2 מאזין על port 3000
netstat -ano | findstr :3000

# 3. בדוק health ישירות
curl http://localhost:3000/api/health

# 4. וודא ARR proxy מופעל
# IIS Manager → Server → Application Request Routing → Server Proxy Settings
# Enable proxy = TRUE

# 5. בדוק web.config
Get-Content D:\procurement\public\web.config
```

---

### בעיה: Database Locked

**תסמינים:**
- Error: `database is locked`
- שגיאות כתיבה ל-DB

**פתרון:**
```powershell
# 1. עצור את כל ה-instances
pm2 stop all

# 2. המתן שכל התהליכים יסגרו
Start-Sleep -Seconds 5

# 3. בדוק שאין תהליך נעול
Get-Process | Where-Object { $_.Name -like "*node*" }

# 4. הפעל מחדש
pm2 start all
```

---

### בעיה: גרסאות Node.js/npm לא נכונות

**תסמינים:**
- שגיאות בזמן `npm install`
- שגיאות בזמן build

**פתרון:**
```powershell
# וידוא גרסאות
node --version   # צריך להיות v20.x.x
npm --version    # צריך להיות 10.x.x

# אם לא - התקן מחדש Node.js 20.x LTS
```

---

### בעיה: Email Notifications לא עובדים

**תסמינים:**
- גיבויים/ניטור לא שולחים מיילים
- שגיאות SMTP

**פתרון:**
```powershell
# בדוק הגדרות SMTP ב-.env
Get-Content D:\procurement\.env | Select-String "SMTP"

# Test SMTP connection
$smtp = New-Object Net.Mail.SmtpClient("smtp.your-company.com", 587)
$smtp.EnableSsl = $false
$smtp.Credentials = New-Object Net.NetworkCredential("user", "pass")

try {
    $smtp.Send("test@company.com", "recipient@company.com", "Test", "Test")
    Write-Host "SMTP works!" -ForegroundColor Green
} catch {
    Write-Host "SMTP failed: $_" -ForegroundColor Red
}
```

---

## נספח: פקודות שימושיות

### ניהול PM2

```powershell
# סטטוס
pm2 list
pm2 monit              # Monitor real-time

# Restart
pm2 restart all        # Restart כל ה-instances
pm2 reload all         # Reload with zero-downtime

# Logs
pm2 logs               # Real-time logs
pm2 logs --lines 100   # Last 100 lines
pm2 flush              # Clear logs

# Stop/Start
pm2 stop all
pm2 start all
pm2 delete all         # Remove all processes

# Info
pm2 describe procurement-system  # Detailed info
pm2 info 0             # Info about instance 0
```

### ניהול Windows Services

```powershell
# סטטוס
Get-Service -Name "PM2", "W3SVC"

# Start/Stop/Restart
Start-Service -Name "PM2"
Stop-Service -Name "PM2"
Restart-Service -Name "PM2"

# Change startup type
Set-Service -Name "PM2" -StartupType Automatic
```

### ניהול IIS

```powershell
# Restart IIS
iisreset

# Stop/Start Site
Stop-Website -Name "Procurement"
Start-Website -Name "Procurement"

# List Sites
Get-Website

# Application Pool status
Get-WebAppPoolState -Name "ProcurementAppPool"

# Recycle App Pool
Restart-WebAppPool -Name "ProcurementAppPool"
```

### Database Management

```powershell
# Backup ידני
D:\procurement\deployment\backup-database.ps1

# Prisma Studio
cd D:\procurement
npx prisma studio

# Migrations
npx prisma migrate deploy

# Reset database (DANGER!)
# npx prisma migrate reset
```

---

## סיכום - Checklist סופי

לאחר השלמת כל השלבים, וודא:

### Infrastructure
- [ ] Node.js 20.x מותקן ופועל
- [ ] PM2 Windows Service רץ ומופעל ב-Automatic
- [ ] IIS רץ עם ARR + URL Rewrite modules
- [ ] תיקיות נוצרו: D:\procurement, D:\logs\procurement, D:\backups\procurement

### Application
- [ ] קבצי האפליקציה ב-D:\procurement
- [ ] .env מוגדר עם כל הערכים הנכונים
- [ ] npm install הושלם
- [ ] Database migrations הושלמו
- [ ] Seed data נוספו
- [ ] npm run build הצליח

### PM2
- [ ] 3 instances רצים (pm2 list)
- [ ] pm2 save בוצע
- [ ] Health check עובד: http://localhost:3000/api/health

### IIS
- [ ] Application Pool נוצר
- [ ] Website נוצר
- [ ] web.config במקום
- [ ] ARR Proxy מופעל
- [ ] Health check עובד: http://procurementapp/api/health

### Security
- [ ] .env מוגן בהרשאות
- [ ] Firewall rules מוגדרים
- [ ] NEXTAUTH_SECRET שונה מברירת מחדל
- [ ] ENCRYPTION_KEY שונה מברירת מחדל

### Backups & Monitoring
- [ ] Task Scheduler: גיבוי יומי
- [ ] Task Scheduler: ניטור כל 10 דקות
- [ ] Email alerts מוגדרים

### Testing
- [ ] Login page נטען
- [ ] התחברות מצליחה
- [ ] Server restart - הכל עולה אוטומטית
- [ ] PM2 instance crash - עולה אוטומטית

---

## תמיכה

אם נתקלת בבעיה שלא מופיעה כאן:

1. בדוק לוגים:
   - PM2: `pm2 logs`
   - IIS: `C:\inetpub\logs\LogFiles\`
   - App: `D:\logs\procurement\app.log`

2. פנה לתיעוד:
   - [docs/MAINTENANCE.md](./MAINTENANCE.md) - ניהול שוטף
   - [docs/MONITORING.md](./MONITORING.md) - ניטור מתקדם

3. בדוק health:
   ```powershell
   D:\procurement\deployment\monitor-services.ps1 -Once
   ```

---

**הצלחה! 🎉**

המערכת מוכנה לשימוש ב-production.

</div>
