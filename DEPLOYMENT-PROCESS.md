# תהליך פריסה אוטומטי - SOP

## סקירה כללית

מסמך זה מתאר את תהליך הפריסה האוטומטי של אפליקציות Next.js לסביבת ייצור.
תהליך זה ניתן לשימוש חוזר בכל אפליקציה בארגון.

---

## מושגי יסוד

### מה זה "גרסה" (Version)?
כל שינוי משמעותי באפליקציה מקבל מספר גרסה, למשל:
- `v1.0.0` - גרסה ראשונה יציבה
- `v1.1.0` - פיצ'ר חדש
- `v1.1.1` - תיקון באג קטן

### מה זה "Tag"?
סימן בגיט שמציין "כאן בדיוק הקוד של הגרסה הזאת".

### מה זה "Release"?
חבילה מוכנה להתקנה שכוללת את כל הקבצים הדרושים.

---

## תהליך עבודה (4 שלבים)

```
┌──────────────────────────────────────────────────────────────────┐
│                        התהליך המלא                                │
└──────────────────────────────────────────────────────────────────┘

1. מפתח:
   • מפתח features כרגיל
   • בודק שהכל עובד
   • מריץ: npm run release:minor
   ↓

2. GitHub Actions (אוטומטי):
   • בונה את האפליקציה
   • יוצר קובץ ZIP מוכן
   • מפרסם Release בגיטהאב
   זמן: ~5 דקות
   ↓

3. איש מערכת:
   • נכנס לגיטהאב → Releases
   • רואה גרסה חדשה זמינה
   • מריץ: .\update-production.ps1 -Version "1.1.0"
   זמן: ~2 דקות
   ↓

4. סקריפט (אוטומטי):
   • יוצר גיבוי מלא
   • מוריד את הגרסה החדשה
   • מעדכן את הקבצים (ללא מחיקת DB!)
   • מריץ migrations בטוחות
   • בודק שהאפליקציה עובדת
   • אם יש בעיה → rollback אוטומטי
   ✅ סיום!
```

---

## כלים נדרשים

### בשרת הפיתוח (מפתח):
- Git
- Node.js 20+
- npm
- גישה לגיטהאב

### בשרת הייצור (איש מערכת):
- Windows Server 2019+
- Node.js 20 LTS
- PM2 (מנהל תהליכים)
- PowerShell 5.1+
- חיבור לאינטרנט (להורדת גרסאות)

### בגיטהאב:
- GitHub repository (public או private)
- GitHub Actions מופעל (חינם)

---

## אבטחת מידע וגיבויים

### שכבת הגנה 1: Prisma Migrations
**הדאטהבייס לא נמחק אף פעם!**

כאשר מעדכנים גרסה, Prisma רק מוסיף/משנה מבנה, לא מוחק דאטה:
```sql
-- מה שקורה:
✅ ALTER TABLE suppliers ADD COLUMN website TEXT;  -- הוספת עמודה
✅ CREATE TABLE notifications (...);               -- טבלה חדשה
✅ CREATE INDEX idx_email ON users(email);         -- אינדקס חדש

-- מה שלא קורה:
❌ DROP DATABASE procurement;
❌ DELETE FROM users;
❌ TRUNCATE TABLE suppliers;
```

**הדאטה הקיימת נשמרת תמיד!**

### שכבת הגנה 2: גיבוי אוטומטי
לפני **כל** עדכון:
```
C:\backups\procurement\
├── v1.0.0-20251026-140523\    ← גיבוי מלא + DB
├── v1.1.0-20251027-093012\    ← גיבוי מלא + DB
└── v1.2.0-20251028-155734\    ← גיבוי מלא + DB

שמירה: 10 גרסאות אחרונות
```

### שכבת הגנה 3: Rollback
אם משהו לא עובד:
```powershell
# אוטומטי: אם health check נכשל, הסקריפט עושה rollback
# ידני: אם גילית בעיה אחרי שעה/יום
.\rollback-production.ps1 -ToVersion "1.0.0"
```

**תוך דקה אחת חוזרים לגרסה שעבדה!**

---

## זמנים משוערים

| שלב | זמן | מי מבצע |
|-----|-----|---------|
| פיתוח features | שעות-ימים | מפתח |
| יצירת גרסה (`npm run release:minor`) | 10 שניות | מפתח |
| GitHub Actions (build + ZIP) | 3-5 דקות | אוטומטי |
| הורדת גרסה | 1-2 דקות | איש מערכת |
| עדכון בשרת | 1-2 דקות | אוטומטי |
| **סה"כ זמן downtime** | **~2 דקות** | - |

---

## דוגמה מעשית

### תרחיש: הוספת שדה "טלפון" לספקים

**שלב 1: פיתוח (מפתח)**
```bash
# 1. עריכת prisma/schema.prisma
model Supplier {
  ...
  phone String?  // שדה חדש
}

# 2. יצירת migration
npx prisma migrate dev --name add_supplier_phone

# 3. בדיקה מקומית
npm run dev

# 4. הכל עובד? פרסום גרסה!
npm run release:minor
```

**שלב 2: GitHub (אוטומטי - 5 דקות)**
```
GitHub Actions:
✓ התקנת תלויות
✓ בניית אפליקציה
✓ יצירת ZIP
✓ פרסום Release v1.1.0
```

**שלב 3: שרת ייצור (איש מערכת - 2 דקות)**
```powershell
# הרצת סקריפט עדכון
.\update-production.ps1 -Version "1.1.0"

# מה קורה אוטומטית:
✓ גיבוי מלא (כולל DB)
✓ הורדת v1.1.0.zip
✓ עדכון קבצים
✓ הרצת migration: ALTER TABLE suppliers ADD COLUMN phone TEXT;
✓ הפעלת אפליקציה
✓ בדיקת health
✅ הצלחה!

# התוצאה:
# טבלת suppliers:
# | id | name    | email         | phone    |
# |----|---------|---------------|----------|
# | 01 | ספק א   | a@test.com    | NULL     | ← דאטה ישנה נשמרה!
# | 02 | ספק ב   | b@test.com    | NULL     | ← דאטה ישנה נשמרה!
```

---

## שימוש חוזר באפליקציות אחרות

תהליך זה מתאים לכל אפליקציית Next.js בארגון:

### צעדים להטמעה באפליקציה חדשה:

1. **העתקת קבצים:**
   ```
   .github/workflows/release.yml
   deployment/update-production.ps1
   deployment/rollback-production.ps1
   deployment/backup-config.json
   ```

2. **עדכון הגדרות ב-`update-production.ps1`:**
   ```powershell
   $RepoOwner = "your-org"
   $RepoName = "your-app-name"
   $AppName = "your-app"
   $DeployPath = "C:\inetpub\your-app"
   ```

3. **הוספת scripts ל-`package.json`:**
   ```json
   "release:patch": "npm version patch && git push && git push --tags",
   "release:minor": "npm version minor && git push && git push --tags",
   "release:major": "npm version major && git push && git push --tags"
   ```

4. **תיעוד ספציפי לאפליקציה:**
   - העתקת `QUICK-START.md`
   - עדכון שמות ונתיבים

**זמן הטמעה: ~30 דקות לאפליקציה חדשה**

---

## שאלות ותשובות נפוצות

### מה קורה אם הורדתי גרסה רעה?
```powershell
.\rollback-production.ps1 -ToVersion "1.0.0"
```
תוך דקה אחת אתה בגרסה הקודמת שעבדה.

### האם הדאטהבייס יימחק?
**לא!** Prisma Migrations רק מוסיפים/משנים מבנה, לא מוחקים דאטה.
בנוסף, יש גיבוי אוטומטי לפני כל עדכון.

### מה קורה אם השרת לא מחובר לאינטרנט?
1. הורד את ה-ZIP מגיטהאב במחשב אחר
2. העתק למדיה חיצונית
3. שנה את הסקריפט לקרוא מנתיב מקומי

### כמה זמן השרת לא זמין?
בדרך כלל 1-2 דקות. הזמן שלוקח לעצור את PM2, להחליף קבצים, ולהפעיל מחדש.

### איך אני יודע שהעדכון הצליח?
הסקריפט עושה health check אוטומטי. אם הוא מסתיים בהצלחה - הכל תקין.

---

## תמיכה ועזרה

- מדריך מהיר: [QUICK-START.md](QUICK-START.md)
- הסבר על DB: [DATABASE-MIGRATIONS-EXPLAINED.md](DATABASE-MIGRATIONS-EXPLAINED.md)
- פתרון בעיות: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**עודכן לאחרונה:** אוקטובר 2025
**גרסת SOP:** 1.0
