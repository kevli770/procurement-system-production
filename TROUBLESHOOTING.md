# פתרון בעיות - Troubleshooting

## 🔍 מדריך לפתרון בעיות נפוצות

---

## בעיות בפרסום גרסה (מפתח)

### ❌ בעיה: `npm run release:minor` נכשל

**תסמינים:**
```bash
npm ERR! Git working directory not clean.
```

**פתרון:**
```bash
# יש שינויים שלא עשית להם commit
git status

# עשה commit לשינויים
git add .
git commit -m "Your message"

# עכשיו נסה שוב
npm run release:minor
```

---

### ❌ בעיה: GitHub Actions נכשל

**תסמינים:**
פתחת GitHub → Actions → רואה ❌ אדום

**פתרון 1: בדוק את השגיאה**
```
1. לחץ על ה-workflow הכושל
2. לחץ על השלב האדום
3. קרא את השגיאה
```

**שגיאות נפוצות:**

**א. Build נכשל**
```
Error: Command failed: npm run build
```
**פתרון:** הקוד לא עובר build. תקן את השגיאות:
```bash
# בדוק מקומית:
npm run build

# תקן את השגיאות שמופיעות
# נסה שוב
```

**ב. Prisma generation נכשל**
```
Error: Prisma schema validation failed
```
**פתרון:** בעיה ב-`prisma/schema.prisma`:
```bash
# בדוק validation:
npx prisma validate

# תקן את השגיאות
# commit + push
```

**ג. אין הרשאות**
```
Error: Resource not accessible by integration
```
**פתרון:** בדוק הרשאות ב-Settings → Actions → Workflow permissions
- סמן: "Read and write permissions"

---

## בעיות בעדכון שרת (איש מערכת)

### ❌ בעיה: "Failed to download release"

**תסמינים:**
```powershell
[ERROR] Failed to download release: The remote name could not be resolved
```

**סיבה:** השרת לא מחובר לאינטרנט או חסימת Firewall

**פתרון 1: בדוק חיבור**
```powershell
# בדוק חיבור לגיטהאב
Test-NetConnection github.com -Port 443

# אם זה נכשל - בעיית רשת
```

**פתרון 2: הורדה ידנית**
```
1. במחשב אחר (עם אינטרנט):
   - עבור לגיטהאב Releases
   - הורד את procurement-v1.2.0.zip

2. העתק ל-USB

3. בשרת:
   - העתק ל-C:\temp\procurement-v1.2.0.zip
   - ערוך את update-production.ps1
   - שנה את Get-ReleasePackage לקרוא מ-C:\temp
```

---

### ❌ בעיה: "PM2 is not available"

**תסמינים:**
```powershell
[ERROR] PM2 is not available. Please install PM2 first.
```

**פתרון:**
```powershell
# התקן PM2
npm install -g pm2

# ודא שזה ב-PATH
pm2 --version

# אם עדיין לא עובד, הפעל PowerShell כ-Administrator
```

---

### ❌ בעיה: "Health check failed"

**תסמינים:**
```powershell
[ERROR] Health check failed after 6 attempts
[WARNING] Initiating rollback...
```

**מה קרה:** האפליקציה לא עולה או לא מגיבה על `/api/health`

**פתרון 1: בדוק לוגים**
```powershell
# לוגים של PM2
pm2 logs procurement --lines 50

# חפש שגיאות:
# - Port already in use
# - Database connection failed
# - Module not found
```

**פתרון 2: בדוק ports**
```powershell
# בדוק אם port 3000 תפוס
netstat -ano | findstr :3000

# אם תפוס, עצור את התהליך:
Stop-Process -Id <PID> -Force

# נסה שוב
pm2 restart procurement
```

**פתרון 3: בדוק .env**
```powershell
# ודא ש-.env קיים
type C:\inetpub\procurement\.env

# ודא שיש DATABASE_URL
# אם חסר - העתק מגיבוי:
copy C:\backups\procurement\v1.1.0-xxx\.env C:\inetpub\procurement\
```

---

### ❌ בעיה: "Database migration failed"

**תסמינים:**
```powershell
[WARNING] Database migration warning: ...
```

**סיבה 1: קובץ DB לא קיים**
```powershell
# בדוק אם יש DB
dir C:\inetpub\procurement\prisma\*.db

# אם אין - צור חדש:
cd C:\inetpub\procurement
npx prisma migrate deploy
npx prisma db seed
```

**סיבה 2: DB נעול**
```
Error: database is locked
```
**פתרון:**
```powershell
# עצור את האפליקציה
pm2 stop procurement

# המתן 5 שניות
Start-Sleep -Seconds 5

# נסה שוב
cd C:\inetpub\procurement
npx prisma migrate deploy

# הפעל
pm2 start procurement
```

---

### ❌ בעיה: "Application not starting"

**תסמינים:**
```powershell
pm2 status
# Status: errored
```

**פתרון צעד אחר צעד:**

**1. בדוק לוגים:**
```powershell
pm2 logs procurement --lines 100
```

**2. שגיאות נפוצות ופתרונות:**

**א. "Cannot find module"**
```
Error: Cannot find module 'next'
```
**פתרון:**
```powershell
cd C:\inetpub\procurement
npm install
pm2 restart procurement
```

**ב. "Port 3000 already in use"**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**פתרון:**
```powershell
# מצא מי תופס את ה-port
netstat -ano | findstr :3000

# עצור את התהליך
taskkill /PID <PID> /F

# או שנה port ב-.env
echo PORT=3001 >> C:\inetpub\procurement\.env
pm2 restart procurement
```

**ג. "PRISMA_CLIENT_ENGINE_TYPE is invalid"**
```
Error: Prisma Client could not locate the Query Engine
```
**פתרון:**
```powershell
cd C:\inetpub\procurement
npx prisma generate
pm2 restart procurement
```

---

## בעיות עם Rollback

### ❌ בעיה: "No backup available"

**תסמינים:**
```powershell
[ERROR] No backup available for rollback!
```

**סיבה:** אין גיבויים ב-`C:\backups\procurement`

**פתרון:**
```powershell
# בדוק אם התיקייה קיימת
dir C:\backups\procurement

# אם לא קיימת - משהו מחק את הגיבויים!
# אפשרות 1: שחזר מגיבוי חיצוני (tape/cloud)
# אפשרות 2: התקן את הגרסה הקודמת מחדש מגיטהאב
```

---

### ❌ בעיה: Rollback נכשל

**תסמינים:**
```powershell
[ERROR] Rollback failed: Access denied
```

**פתרון:**
```powershell
# הרץ PowerShell כ-Administrator

# או בדוק הרשאות:
icacls C:\inetpub\procurement
icacls C:\backups\procurement

# תן הרשאות מלאות:
icacls C:\inetpub\procurement /grant Everyone:F /T
```

---

## בעיות עם הדאטהבייס

### ❌ בעיה: "Database file is corrupt"

**תסמינים:**
```
Error: database disk image is malformed
```

**פתרון:**
```powershell
# 1. עצור את האפליקציה
pm2 stop procurement

# 2. גבה את ה-DB הפגום
copy C:\inetpub\procurement\prisma\procurement.db C:\temp\corrupt.db

# 3. נסה לתקן
cd C:\inetpub\procurement\prisma
sqlite3 procurement.db ".recover" > recovered.sql
sqlite3 procurement-new.db < recovered.sql

# 4. אם התיקון עבד
move procurement.db procurement-old.db
move procurement-new.db procurement.db

# 5. הפעל
pm2 start procurement

# אם לא עבד - שחזר מגיבוי:
copy C:\backups\procurement\v1.1.0-xxx\prisma\procurement.db C:\inetpub\procurement\prisma\
```

---

### ❌ בעיה: "Data was lost after update"

**תסמינים:**
נתונים שהיו לפני העדכון נעלמו

**סיבה:** משהו דרס את קובץ ה-DB (לא אמור לקרות!)

**פתרון:**
```powershell
# 1. עצור מיד
pm2 stop procurement

# 2. שחזר מגיבוי
copy C:\backups\procurement\v1.1.0-20251026-140500\prisma\procurement.db C:\inetpub\procurement\prisma\

# 3. rollback לגרסה קודמת
.\rollback-production.ps1 -ToVersion "1.1.0"

# 4. דווח למפתח על הבעיה
```

---

## בעיות כלליות

### ❌ בעיה: "Out of disk space"

**תסמינים:**
```
Error: ENOSPC: no space left on device
```

**פתרון:**
```powershell
# בדוק שטח דיסק
Get-PSDrive C

# נקה גיבויים ישנים
cd C:\backups\procurement
dir | Sort-Object CreationTime | Select-Object -First 5 | Remove-Item -Recurse

# נקה node_modules ישן
Remove-Item C:\inetpub\procurement\node_modules -Recurse -Force
npm install

# נקה לוגים
Remove-Item C:\backups\procurement\logs\*.log -Force
```

---

### ❌ בעיה: "Permission denied"

**תסמינים:**
```
Error: EPERM: operation not permitted
```

**פתרון:**
```powershell
# הפעל PowerShell כ-Administrator
# לחץ ימני על PowerShell → "Run as Administrator"

# או תן הרשאות:
icacls C:\inetpub\procurement /grant Everyone:F /T
```

---

## 🆘 כשהכל נכשל

### תהליך שחזור מלא:

```powershell
# 1. עצור הכל
pm2 stop all

# 2. גבה את הנתונים החשובים
copy C:\inetpub\procurement\prisma\*.db C:\temp\
copy C:\inetpub\procurement\.env C:\temp\

# 3. מחק את ההתקנה הנוכחית
Remove-Item C:\inetpub\procurement\* -Recurse -Force

# 4. הורד את הגרסה הידועה האחרונה שעבדה מגיטהאב
# עבור ל-Releases → הורד v1.0.0.zip

# 5. חלץ לתיקייה
Expand-Archive procurement-v1.0.0.zip -DestinationPath C:\inetpub\procurement

# 6. שחזר .env ו-DB
copy C:\temp\.env C:\inetpub\procurement\
copy C:\temp\*.db C:\inetpub\procurement\prisma\

# 7. התקן תלויות
cd C:\inetpub\procurement
npm install

# 8. הפעל
pm2 start ecosystem.config.js

# 9. בדוק
pm2 status
pm2 logs procurement
```

---

## 📞 קבלת עזרה

### לפני שפונים לתמיכה:

1. **אסוף מידע:**
```powershell
# גרסה נוכחית
npm version

# סטטוס PM2
pm2 status

# לוגים אחרונים
pm2 logs procurement --lines 50 > C:\temp\logs.txt

# לוג deployment
type C:\backups\procurement\logs\deployment-latest.log
```

2. **תעד את הבעיה:**
- מה ניסית לעשות?
- מה קרה?
- מה השגיאה המדויקת?
- מתי זה התחיל?

3. **פנה למפתח עם:**
- קבצי הלוג
- תיאור הבעיה
- צילומי מסך

---

## ✅ Checklist למניעת בעיות

### לפני כל עדכון:

- [ ] יש גיבוי עדכני
- [ ] יש שטח דיסק מספיק (לפחות 5GB פנויים)
- [ ] האפליקציה רצה ללא שגיאות
- [ ] קראת את release notes
- [ ] יש זמן לעשות rollback אם צריך (לא ביום שישי בערב!)

### אחרי כל עדכון:

- [ ] pm2 status → online
- [ ] האפליקציה נפתחת בדפדפן
- [ ] אין שגיאות בלוגים
- [ ] הדאטה נשמרה
- [ ] כל הפיצ'רים עובדים

---

**זקוקים לעזרה נוספת?**
- [מדריך מהיר](QUICK-START.md)
- [תהליך מלא](DEPLOYMENT-PROCESS.md)
- [אבטחת DB](DATABASE-MIGRATIONS-EXPLAINED.md)
