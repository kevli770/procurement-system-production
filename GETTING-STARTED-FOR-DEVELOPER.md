# מדריך מפתח - איך להתחיל עם המערכת החדשה

## 🎉 מה עשינו?

יצרנו רפוזיטורי חדש `umitgh/procurement-system` עם:

✅ GitHub Actions - build אוטומטי
✅ סקריפטים לפריסה אוטומטית
✅ תיעוד מקיף בעברית
✅ הגנה על דאטהבייס
✅ מנגנון Rollback

---

## 📍 איפה הכל נמצא?

### הרפוזיטורי החדש:
🔗 https://github.com/umitgh/procurement-system

### הרפוזיטורי הישן:
🔗 https://github.com/kevli770/procurement-system (נשאר ללא שינוי)

---

## 🚀 איך להתחיל לעבוד?

### אופציה A: להמשיך בפרויקט הישן (פשוט יותר)

אם אתה רוצה להמשיך לעבוד בפרויקט הנוכחי שלך:

```bash
# בפרויקט procurement (הנוכחי)
cd c:\Users\kevin\OneDrive\מסמכים\Dev-Projects\Union\procurement

# הוסף remote חדש
git remote add production https://github.com/umitgh/procurement-system.git

# כשאתה מוכן לפרסם גרסה חדשה:
# 1. עשה push לפרויקט הרגיל
git add .
git commit -m "Your changes"
git push origin main

# 2. עשה push גם ל-production
git push production main

# 3. יצור גרסה
git tag v0.2.0
git push production --tags
```

---

### אופציה B: לעבוד ישירות ב-production (מומלץ)

אם אתה רוצה להעביר את כל הפיתוח לרפו החדש:

```bash
# פתח terminal חדש
cd c:\Users\kevin\OneDrive\מסמכים\Dev-Projects\Union\

# כבר יש procurement-system-production כאן!
cd procurement-system-production

# התקן תלויות
npm install

# הרץ dev
npm run dev
```

**מעכשיו תעבוד ב-`procurement-system-production`**

---

## 📝 תהליך עבודה יומיומי

### 1. פיתוח רגיל

```bash
# ברפו procurement-system-production
npm run dev

# עשה שינויים...
# בדוק שהכל עובד...
```

### 2. Commit כרגיל

אני אעשה commit + push אוטומטית (כמו תמיד!)

### 3. כשמוכן לפרודקשן

**הדרך הקלה:**
```bash
npm run release:minor
```

זהו! זה יעשה אוטומטית:
- ✅ יעדכן package.json (0.1.0 → 0.2.0)
- ✅ יצור git tag
- ✅ יעשה push
- ✅ יפעיל GitHub Actions

### 4. בדוק שה-Release מוכן

אחרי 5 דקות:

```bash
# בדוק אם GitHub Actions סיים
gh run list --limit 1

# או פתח בדפדפן:
# https://github.com/umitgh/procurement-system/releases
```

תראה: **📦 v0.2.0 - Latest Release**

---

## 🔄 איך להעביר שינויים מהפרויקט הישן?

אם עשית שינויים בפרויקט הישן ורוצה להעביר:

```bash
# ב-procurement (ישן)
cd c:\Users\kevin\OneDrive\מסמכים\Dev-Projects\Union\procurement
git format-patch -1 HEAD

# זה יוצר קובץ: 0001-Your-Commit.patch

# ב-procurement-system-production (חדש)
cd ../procurement-system-production
git am ../procurement/0001-Your-Commit.patch

# זהו! השינוי עבר
```

**או פשוט העתק קבצים:**
```bash
# העתק קובץ ספציפי
copy ..\procurement\src\app\api\your-file.ts .\src\app\api\

# commit
git add .
git commit -m "Added new API endpoint"
```

---

## 📚 התיעוד שיצרנו

### למפתחים (אתה):
- **[QUICK-START.md](QUICK-START.md)** - מדריך מהיר 2 דקות
- **[DEPLOYMENT-PROCESS.md](DEPLOYMENT-PROCESS.md)** - תהליך מלא
- **[DATABASE-MIGRATIONS-EXPLAINED.md](DATABASE-MIGRATIONS-EXPLAINED.md)** - למה הדאטה בטוחה

### לאיש מערכת:
- **[deployment/update-production.ps1](deployment/update-production.ps1)** - סקריפט עדכון
- **[deployment/rollback-production.ps1](deployment/rollback-production.ps1)** - סקריפט rollback
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - פתרון בעיות

---

## ✅ בדיקה ראשונה

בואו נבדוק שהכל עובד:

### 1. בדוק שהרפו החדש רץ

```bash
cd c:\Users\kevin\OneDrive\מסמכים\Dev-Projects\Union\procurement-system-production
npm run dev
```

פתח: http://localhost:3000

אם האפליקציה רצה - מצוין! ✅

### 2. בדוק GitHub Actions

```bash
gh run list --limit 1
```

תראה:
```
completed	... Build and Release	v0.1.0 ...
```

אם `completed` - מעולה! ✅

### 3. בדוק Releases

פתח:
https://github.com/umitgh/procurement-system/releases

תראה: **v0.1.0** עם קובץ ZIP

אם יש - הכל מוכן! ✅

---

## 🎯 הצעד הבא שלך

### אופציה 1: להישאר עם שני repos

- `procurement` - פיתוח יומיומי
- `procurement-system-production` - רק לפרסום גרסאות
- מדי פעם תעתיק שינויים מ-procurement ל-production

### אופציה 2: לעבור ל-production (מומלץ!)

```bash
# שמור את הפרויקט הישן לארכיון
cd c:\Users\kevin\OneDrive\מסמכים\Dev-Projects\Union\
mv procurement procurement-ARCHIVE

# השתמש ב-production
cd procurement-system-production

# מעכשיו הכל פה!
```

**למה מומלץ?**
- ✅ רפו אחד פשוט יותר
- ✅ fresh start ללא היסטוריה מבלבלת
- ✅ שם ברור "production"
- ✅ כל התיעוד והמערכת במקום אחד

---

## 💡 טיפים

### שמירת הרפו הישן

אם תרצה לשמור את הישן לעיון/ארכיון:

```bash
# שנה שם
mv procurement procurement-OLD-ARCHIVE-2025-10-26

# או העתק
copy procurement procurement-BACKUP
```

### העברת .env

```bash
# אם יש לך .env מותאם בפרויקט הישן:
copy ..\procurement\.env .\.env
```

### העברת DB

```bash
# אם יש לך DB עם דאטה:
copy ..\procurement\prisma\*.db .\prisma\
```

---

## 🆘 שאלות נפוצות

### ש: מה קורה עם הרפו הישן?

ת: הוא נשאר ללא שינוי. אתה יכול:
- לשמור אותו לארכיון
- להמשיך לעבוד איתו בצד
- למחוק אותו (אחרי שבדקת שהחדש עובד!)

---

### ש: האם אני חייב לעבור לרפו החדש?

ת: לא חייב! אתה יכול להמשיך לעבוד בישן ופשוט לעשות push ל-production כשמוכן לפרסם.

---

### ש: מה אם אני רוצה לבטל ולחזור לישן?

ת: בכלל לא בעיה! הרפו הישן לא נמחק. פשוט תמשיך לעבוד איתו.

---

### ש: איך אני יוצר גרסה חדשה?

ת: פשוט מאוד:

```bash
# פיצ'ר חדש
npm run release:minor

# תיקון באג
npm run release:patch

# שינוי גדול
npm run release:major
```

---

### ש: איך אני בודק שה-Release מוכן?

ת: שתי דרכים:

```bash
# בטרמינל
gh run list --limit 1

# או בדפדפן
# https://github.com/umitgh/procurement-system/releases
```

אחרי 5 דקות תראה את הגרסה החדשה עם ZIP מוכן להורדה.

---

## 📞 צריך עזרה?

1. **בדוק [QUICK-START.md](QUICK-START.md)**
2. **בדוק [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**
3. **שאל אותי!**

---

**מזל טוב! 🎉**
**יש לך עכשיו מערכת פריסה מקצועית!**

**הרפו החדש:**
🔗 https://github.com/umitgh/procurement-system

**תיעוד מלא:**
📘 [QUICK-START.md](QUICK-START.md)
📘 [DEPLOYMENT-PROCESS.md](DEPLOYMENT-PROCESS.md)
📘 [DATABASE-MIGRATIONS-EXPLAINED.md](DATABASE-MIGRATIONS-EXPLAINED.md)

**מה הלאה?**
בחר אופציה (1 או 2 למעלה) ותתחיל לעבוד! 🚀
