# מדריך מהיר - פריסת גרסאות

## 📱 למפתח - איך לפרסם גרסה חדשה

### תרחיש: סיימת לפתח פיצ'ר חדש ואתה מוכן לפרוס לייצור

**צעד 1: ודא שהכל עובד**
```bash
# בדיקה מקומית
npm run dev

# בדיקת build
npm run build

# אם יש migrations חדשים
npx prisma migrate dev
```

**צעד 2: פרסם גרסה**
```bash
# פיצ'ר חדש או שינוי בינוני
npm run release:minor

# תיקון באג קטן
npm run release:patch

# שינוי גדול (API breaking)
npm run release:major
```

**זהו! המערכת תעשה אוטומטית:**
- ✅ תעדכן את package.json עם מספר גרסה חדש
- ✅ תיצור git tag
- ✅ תעלה לגיטהאב
- ✅ תפעיל GitHub Actions
- ✅ GitHub Actions יבנה ויפרסם Release (5 דקות)

**צעד 3: הודע לאיש המערכת**
```
"גרסה v1.2.0 מוכנה בגיטהאב"
או שלח לינק:
https://github.com/kevli770/procurement-system-production/releases
```

---

## 💻 לאיש מערכת - איך לעדכן בשרת

### תרחיש: המפתח הודיע שיש גרסה חדשה

**צעד 1: בדוק מה יש**
```
1. פתח דפדפן
2. עבור ל: https://github.com/kevli770/procurement-system-production/releases
3. תראה: "📦 v1.2.0 - Latest Release"
4. קרא את release notes - מה השתנה?
```

**צעד 2: הרץ סקריפט עדכון**
```powershell
# התחבר לשרת (RDP)
cd C:\inetpub\procurement\deployment

# הרץ עדכון
.\update-production.ps1 -Version "1.2.0"

# הסקריפט ישאל: "Continue? (yes/no)"
# הקלד: yes
```

**המערכת תעשה אוטומטית:**
```
✓ גיבוי מלא
✓ הורדת גרסה חדשה
✓ עדכון קבצים
✓ הרצת migrations
✓ בדיקת health
✓ rollback אוטומטי אם יש בעיה
```

**זמן משוער: 2 דקות**

**צעד 3: ודא שהכל עובד**
```powershell
# בדוק סטטוס
pm2 status

# בדוק לוגים
pm2 logs procurement --lines 20

# בדוק באפליקציה
# פתח דפדפן: http://localhost:3000
```

**זהו! ✅**

---

## 🔄 אם משהו לא עובד - Rollback

### תרחיש: הגרסה החדשה לא עובדת טוב

**אופציה 1: Rollback אוטומטי**
אם הסקריפט מזהה בעיה, הוא עושה rollback אוטומטי.
אתה לא צריך לעשות כלום!

**אופציה 2: Rollback ידני**
אם גילית בעיה אחרי שעה/יום:

```powershell
cd C:\inetpub\procurement\deployment

# רשימת גיבויים זמינים
.\rollback-production.ps1

# תראה רשימה:
# [1] v1.1.0 - 2025-10-25 14:00
# [2] v1.0.0 - 2025-10-24 10:00
# ...

# הקלד את המספר או השתמש ב-flag:
.\rollback-production.ps1 -ToVersion "1.1.0"

# הסקריפט ישאל: "Are you sure? (yes/no)"
# הקלד: yes
```

**זמן: 1 דקה**

**חזרת לגרסה שעבדה! ✅**

---

## 📋 Cheat Sheet - פקודות מהירות

### למפתח:
| מה | פקודה |
|---|---|
| תיקון באג קטן | `npm run release:patch` |
| פיצ'ר חדש | `npm run release:minor` |
| שינוי גדול | `npm run release:major` |
| בדיקת גרסה נוכחית | `npm version` |

### לאיש מערכת:
| מה | פקודה |
|---|---|
| עדכון לגרסה חדשה | `.\update-production.ps1 -Version "X.Y.Z"` |
| rollback | `.\rollback-production.ps1 -ToVersion "X.Y.Z"` |
| סטטוס אפליקציה | `pm2 status` |
| לוגים | `pm2 logs procurement` |
| restart | `pm2 restart procurement` |
| רשימת גיבויים | `dir C:\backups\procurement` |

---

## ❓ שאלות נפוצות

### ש: כמה זמן לוקח?
**ת:**
- GitHub Actions: 5 דקות (אוטומטי)
- עדכון בשרת: 2 דקות
- Rollback: 1 דקה

### ש: האפליקציה תהיה down?
**ת:** כן, בערך 1-2 דקות (הזמן להחליף קבצים ולהפעיל מחדש).

### ש: מה קורה עם הדאטהבייס?
**ת:**
- הדאטה **לא נמחקת אף פעם**
- רק המבנה (טבלאות/עמודות) מתעדכן
- יש גיבוי אוטומטי לפני כל עדכון
- [קרא עוד על Migrations](DATABASE-MIGRATIONS-EXPLAINED.md)

### ש: איך אני יודע שהעדכון הצליח?
**ת:** הסקריפט יראה:
```
✅ DEPLOYMENT SUCCESSFUL!
```

אם הוא לא מסתיים בהצלחה - זה עשה rollback אוטומטי.

### ש: מה אם אני צריך עזרה?
**ת:**
1. בדוק [פתרון בעיות](TROUBLESHOOTING.md)
2. בדוק לוגים: `C:\backups\procurement\logs\`
3. פנה למפתח עם הלוג

---

## 🎯 דוגמה מלאה מקצה לקצה

### תרחיש: הוספת שדה "טלפון" לספקים

**מפתח (10 דקות):**
```bash
# 1. עדכון schema
# vim prisma/schema.prisma
# הוספת: phone String?

# 2. יצירת migration
npx prisma migrate dev --name add_supplier_phone

# 3. בדיקה
npm run dev

# 4. פרסום
npm run release:minor
# גרסה חדשה: v1.2.0

# 5. הודעה לאיש מערכת
"v1.2.0 מוכן לפריסה"
```

**GitHub (5 דקות - אוטומטי):**
```
✓ Build
✓ Create ZIP
✓ Publish Release v1.2.0
```

**איש מערכת (2 דקות):**
```powershell
# 1. עדכון
.\update-production.ps1 -Version "1.2.0"
# הקלד: yes

# 2. בדיקה
pm2 status
# Status: online ✓

# 3. בדיקה באפליקציה
# דף ספקים → עכשיו יש שדה "טלפון" ✓
```

**סה"כ: 17 דקות (מקוד לייצור)**

---

## 📚 מסמכים נוספים

- [תהליך מלא](DEPLOYMENT-PROCESS.md) - הסבר מפורט על כל התהליך
- [אבטחת DB](DATABASE-MIGRATIONS-EXPLAINED.md) - למה הדאטה בטוחה
- [פתרון בעיות](TROUBLESHOOTING.md) - מה לעשות אם משהו לא עובד

---

**עודכן:** אוקטובר 2025
