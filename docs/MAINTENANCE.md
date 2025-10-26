# מדריך תחזוקה שוטפת - Procurement System

<div dir="rtl">

## תוכן עניינים

1. [תחזוקה יומית](#תחזוקה-יומית)
2. [תחזוקה שבועית](#תחזוקה-שבועית)
3. [עדכון גרסה](#עדכון-גרסה)
4. [ניהול משתמשים](#ניהול-משתמשים)
5. [ניהול Database](#ניהול-database)
6. [שחזור מגיבוי](#שחזור-מגיבוי)
7. [פקודות שימושיות](#פקודות-שימושיות)

---

## תחזוקה יומית

### בדיקת Health (5 דקות)

```powershell
# 1. בדוק services
Get-Service -Name "PM2", "W3SVC" | Format-Table -AutoSize

# 2. בדוק PM2 processes
pm2 list

# 3. בדוק health endpoint
curl http://localhost:3000/api/health

# 4. בדוק לוגים לשגיאות
pm2 logs --lines 50 --err
```

### בדיקת Logs

```powershell
# שגיאות אחרונות
Get-Content D:\logs\procurement\pm2-err.log -Tail 20

# אזהרות באפליקציה
Get-Content D:\logs\procurement\app.log -Tail 50 | Select-String "WARN|ERROR"
```

### בדיקת Disk Space

```powershell
# בדוק שיש מקום פנוי
Get-PSDrive D | Select-Object Used,Free,@{n='Free%';e={[math]::Round($_.Free/$_.Used*100,2)}}
```

אזהרה אם פחות מ-20% פנוי!

---

## תחזוקה שבועית

### ניקוי Logs (כל שבוע)

```powershell
# ארכוב logs ישנים
$date = Get-Date -Format "yyyyMMdd"
Compress-Archive -Path "D:\logs\procurement\*.log" `
                 -DestinationPath "D:\logs\procurement\archive-$date.zip"

# ניקוי logs
pm2 flush

# מחיקת ארכיונים ישנים (>90 ימים)
Get-ChildItem "D:\logs\procurement\archive-*.zip" |
    Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-90)} |
    Remove-Item
```

### בדיקת Backups

```powershell
# רשימת גיבויים אחרונים
Get-ChildItem D:\backups\procurement\ -Filter "procurement-db-*.db" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 10 Name, Length, LastWriteTime
```

### עדכון Dependencies (אופציונלי)

```powershell
cd D:\procurement

# בדוק עדכונים זמינים
npm outdated

# אם יש עדכוני security
npm audit

# תיקון עדכונים קריטיים בלבד
# npm audit fix --only=critical
```

---

## עדכון גרסה

### תהליך עדכון מלא

#### 1. גיבוי לפני העדכון

```powershell
# גיבוי database
D:\procurement\deployment\backup-database.ps1

# גיבוי קבצים
$date = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item -Path "D:\procurement" `
          -Destination "D:\backups\procurement-full-$date" `
          -Recurse -Force
```

#### 2. הורדת גרסה חדשה

**מ-Git:**
```powershell
cd D:\procurement

# שמור שינויים מקומיים
git stash

# עדכון
git pull origin main

# החזר שינויים (.env וכו')
# git stash pop  # רק אם צריך
```

**מ-ZIP:**
```powershell
# חלץ לתיקייה זמנית
# D:\procurement-new\

# העתק קבצי קוד חדשים (אל תדרוס .env!)
robocopy D:\procurement-new D:\procurement /E /XF .env /XD node_modules .next
```

#### 3. עדכון Dependencies

```powershell
cd D:\procurement

# עדכון packages
npm install

# עדכון Prisma
npm run prisma:generate
```

#### 4. Database Migrations

```powershell
# אם יש migrations חדשים
npx prisma migrate deploy

# בדוק שהכל תקין
npx prisma studio
```

#### 5. Build חדש

```powershell
# Build production
npm run build

# וודא שאין שגיאות!
```

#### 6. Restart Application

```powershell
# Zero-downtime reload
pm2 reload all

# אם צריך restart מלא
pm2 restart all

# וידוא
pm2 list
curl http://localhost:3000/api/health
```

#### 7. בדיקות

```powershell
# Login
# פתח דפדפן: http://procurementapp

# בדוק features עיקריים
# - התחברות
# - יצירת PO
# - אישורים
# - דוחות
```

### Rollback (אם משהו השתבש)

```powershell
# 1. עצור אפליקציה
pm2 stop all

# 2. מחק build ישן
Remove-Item -Path "D:\procurement\.next" -Recurse -Force

# 3. שחזר מגיבוי
$latestBackup = Get-ChildItem D:\backups\procurement-full-* |
                Sort-Object LastWriteTime -Descending |
                Select-Object -First 1

Copy-Item -Path $latestBackup.FullName\* `
          -Destination D:\procurement `
          -Recurse -Force

# 4. שחזר database
$latestDB = Get-ChildItem D:\backups\procurement\procurement-db-*.db |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1

Copy-Item -Path $latestDB.FullName `
          -Destination D:\procurement\prisma\procurement.db `
          -Force

# 5. Restart
pm2 start all
```

---

## ניהול משתמשים

### הוספת משתמש חדש

```powershell
cd D:\procurement
npx prisma studio
```

1. פתח טבלת `User`
2. לחץ **Add Record**
3. מלא:
   - email
   - name
   - role (USER/MANAGER/ADMIN/SUPER_ADMIN)
   - approvalLimit (סכום מקסימלי לאישור)
   - managerId (אם רלוונטי)
   - passwordHash (צריך להצפין!)

**ליצירת password hash:**
```powershell
# במחשב פיתוח, הרץ Node.js:
node -e "console.log(require('bcryptjs').hashSync('password123', 10))"
```

### ביטול משתמש

```powershell
# דרך Prisma Studio:
# 1. מצא משתמש
# 2. שנה isActive ל-false

# או דרך SQL:
cd D:\procurement
sqlite3 prisma\procurement.db
```

```sql
UPDATE User SET isActive = 0 WHERE email = 'user@example.com';
.exit
```

---

## ניהול Database

### Prisma Studio (GUI)

```powershell
cd D:\procurement
npx prisma studio
```

פתוח ב: http://localhost:5555

### SQLite Direct Access

```powershell
# פתח DB
cd D:\procurement\prisma
sqlite3 procurement.db

# queries שימושיות:
```

```sql
-- כל המשתמשים
SELECT id, email, name, role, isActive FROM User;

-- PO pending approval
SELECT poNumber, totalAmount, status, createdAt
FROM PurchaseOrder
WHERE status = 'PENDING_APPROVAL';

-- Top suppliers
SELECT s.name, COUNT(po.id) as orders, SUM(po.totalAmount) as total
FROM Supplier s
LEFT JOIN PurchaseOrder po ON po.supplierId = s.id
GROUP BY s.id
ORDER BY total DESC
LIMIT 10;

.exit
```

### Database Maintenance

```powershell
# Optimize/Vacuum (כל חודש)
cd D:\procurement\prisma
sqlite3 procurement.db "VACUUM;"

# Analyze (לביצועים)
sqlite3 procurement.db "ANALYZE;"

# Check integrity
sqlite3 procurement.db "PRAGMA integrity_check;"
```

---

## שחזור מגיבוי

### שחזור Database

```powershell
# 1. עצור אפליקציה
pm2 stop all

# 2. גבה DB נוכחי
Copy-Item D:\procurement\prisma\procurement.db `
          D:\procurement\prisma\procurement.db.before-restore

# 3. בחר גיבוי
Get-ChildItem D:\backups\procurement\procurement-db-*.db |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 10 Name, LastWriteTime

# 4. שחזר
$backupFile = "D:\backups\procurement\procurement-db-YYYYMMDD-HHMMSS.db"
Copy-Item $backupFile D:\procurement\prisma\procurement.db -Force

# 5. וידוא שלמות
cd D:\procurement\prisma
sqlite3 procurement.db "PRAGMA integrity_check;"

# 6. הפעל מחדש
pm2 start all
```

### שחזור קבצי אפליקציה

```powershell
# 1. גבה .env
Copy-Item D:\procurement\.env D:\procurement\.env.backup

# 2. שחזר קבצים
$backupDir = Get-ChildItem D:\backups\procurement-full-* |
             Sort-Object LastWriteTime -Descending |
             Select-Object -First 1

Remove-Item D:\procurement\* -Recurse -Force -Exclude .env,.env.backup
Copy-Item $backupDir.FullName\* D:\procurement\ -Recurse -Force

# 3. שחזר .env
Copy-Item D:\procurement\.env.backup D:\procurement\.env -Force

# 4. Rebuild
cd D:\procurement
npm install
npm run build

# 5. Restart
pm2 restart all
```

---

## פקודות שימושיות

### PM2 Quick Reference

```powershell
# Status
pm2 list                    # All processes
pm2 describe 0              # Details about instance 0
pm2 monit                   # Real-time monitor

# Logs
pm2 logs                    # All logs
pm2 logs --lines 100        # Last 100 lines
pm2 logs 0                  # Logs from instance 0
pm2 flush                   # Clear logs

# Control
pm2 restart all             # Restart all
pm2 reload all              # Zero-downtime reload
pm2 stop all                # Stop all
pm2 start all               # Start all
pm2 delete all              # Remove all

# Save/Restore
pm2 save                    # Save current state
pm2 resurrect               # Restore saved state
pm2 unstartup               # Remove startup script
```

### Database Quick Commands

```powershell
# Backup
D:\procurement\deployment\backup-database.ps1

# Studio
cd D:\procurement && npx prisma studio

# Migrations
cd D:\procurement && npx prisma migrate deploy

# Generate client
cd D:\procurement && npx prisma generate

# Reset (DANGER!)
# cd D:\procurement && npx prisma migrate reset
```

### Monitoring

```powershell
# One-time check
D:\procurement\deployment\monitor-services.ps1 -Once

# Continuous (Ctrl+C to stop)
D:\procurement\deployment\monitor-services.ps1

# Check specific service
Get-Service -Name "PM2" | Format-List *
```

### Performance

```powershell
# Memory usage
pm2 list

# CPU usage
Get-Process | Where-Object {$_.Name -like "*node*"} |
    Select-Object Name, CPU, WS -First 10

# Disk I/O
Get-Counter "\PhysicalDisk(*)\Disk Reads/sec"
Get-Counter "\PhysicalDisk(*)\Disk Writes/sec"

# Network
Get-NetAdapterStatistics
```

---

## Troubleshooting נפוצים

### אפליקציה איטית

```powershell
# 1. בדוק memory
pm2 list  # האם instances מעל 500MB?

# 2. בדוק CPU
Get-Process node* | Select-Object CPU, WS

# 3. Restart instances
pm2 reload all

# 4. אם ממשיך - הוסף instance
# ערוך ecosystem.config.js: instances: 4
pm2 reload ecosystem.config.js
```

### Logs מתמלאים

```powershell
# הפעל rotation
pm2 install pm2-logrotate

# הגדר rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Database גדול מדי

```powershell
# בדוק גודל
Get-Item D:\procurement\prisma\procurement.db |
    Select-Object Name, @{n='SizeMB';e={[math]::Round($_.Length/1MB,2)}}

# נקה audit logs ישנים (>90 ימים)
cd D:\procurement\prisma
sqlite3 procurement.db

DELETE FROM AuditLog WHERE createdAt < datetime('now', '-90 days');
VACUUM;
.exit
```

---

</div>
