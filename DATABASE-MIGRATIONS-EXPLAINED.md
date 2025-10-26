# Prisma Migrations - הסבר פשוט

## למה המסמך הזה חשוב?

אחת השאלות החשובות ביותר כשמעדכנים מערכת ייצור היא:
**"האם הדאטהבייס שלי יימחק?"**

**התשובה הקצרה: לא! הדאטה שלך בטוחה לחלוטין.**

---

## מה זה Prisma Migrations?

Prisma Migrations זו טכנולוגיה שמאפשרת לעדכן את **המבנה** של הדאטהבייס (טבלאות, עמודות, אינדקסים) בלי לגעת ב**דאטה** הקיימת.

### אנלוגיה מהחיים:
```
דמיין שיש לך ארון בגדים:
├── מגירה 1: חולצות
├── מגירה 2: מכנסיים
└── מגירה 3: גרביים

אתה רוצה להוסיף מגירה 4 לנעליים.

Migration זה כמו:
✅ להוסיף מגירה חדשה
✅ הבגדים שכבר במגירות 1-3 נשארים בדיוק איפה שהם!

Migration זה לא:
❌ לזרוק את כל הבגדים
❌ למחוק מגירות קיימות
❌ להחליף את הארון כולו
```

---

## איך זה עובד?

### כשאתה מוסיף שדה חדש:

**1. אתה משנה את הסכמה:**
```typescript
// prisma/schema.prisma - לפני:
model Supplier {
  id    String @id
  name  String
  email String
}

// אחרי:
model Supplier {
  id      String @id
  name    String
  email   String
  phone   String?  // ← שדה חדש!
}
```

**2. אתה יוצר migration:**
```bash
npx prisma migrate dev --name add_supplier_phone
```

זה יוצר קובץ עם SQL מדויק:
```sql
-- קובץ: 20251026120000_add_supplier_phone/migration.sql
ALTER TABLE "Supplier" ADD COLUMN "phone" TEXT;
```

**3. בשרת הייצור:**
```bash
npx prisma migrate deploy
```

Prisma בודק: "איזה migrations כבר רצו? איזה חדשים?"
```
✓ 20251020_init → כבר רץ, מדלג
✓ 20251021_add_company → כבר רץ, מדלג
⚙ 20251026_add_supplier_phone → חדש! מריץ עכשיו...
```

**4. התוצאה:**
```
לפני העדכון:
┌────┬───────────┬────────────────┐
│ id │ name      │ email          │
├────┼───────────┼────────────────┤
│ 01 │ ספק אלפא  │ alpha@test.com │ ← דאטה קיימת
│ 02 │ ספק ביתא  │ beta@test.com  │ ← דאטה קיימת
└────┴───────────┴────────────────┘

אחרי העדכון:
┌────┬───────────┬────────────────┬───────┐
│ id │ name      │ email          │ phone │
├────┼───────────┼────────────────┼───────┤
│ 01 │ ספק אלפא  │ alpha@test.com │ NULL  │ ← דאטה נשמרה!
│ 02 │ ספק ביתא  │ beta@test.com  │ NULL  │ ← דאטה נשמרה!
└────┴───────────┴────────────────┴───────┘

✅ הדאטה הישנה בדיוק כמו שהייתה!
✅ רק התווספה עמודה חדשה עם ערך NULL
```

---

## סוגי שינויים ב-Migrations

### ✅ שינויים בטוחים (הדאטה נשמרת):

#### 1. הוספת עמודה חדשה
```sql
ALTER TABLE "Supplier" ADD COLUMN "website" TEXT;
```
**תוצאה:** כל השורות הקיימות מקבלות NULL בעמודה החדשה.

#### 2. יצירת טבלה חדשה
```sql
CREATE TABLE "Notification" (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL
);
```
**תוצאה:** טבלה חדשה ריקה נוצרת. טבלאות אחרות לא נגעות.

#### 3. הוספת אינדקס
```sql
CREATE INDEX "idx_supplier_email" ON "Supplier"("email");
```
**תוצאה:** האפליקציה תהיה יותר מהירה. הדאטה לא משתנה.

#### 4. שינוי ברירת מחדל
```sql
ALTER TABLE "Item" ALTER COLUMN "isActive" SET DEFAULT true;
```
**תוצאה:** רק פריטים חדשים יקבלו ברירת מחדל. פריטים קיימים לא משתנים.

---

### ⚠️ שינויים שדורשים תשומת לב:

#### 1. מחיקת עמודה
```sql
ALTER TABLE "Supplier" DROP COLUMN "oldField";
```
**תוצאה:** הדאטה בעמודה הזאת תימחק!

**הגנה:** Prisma ישאל אותך לפני שיעשה את זה:
```
⚠ You are about to drop column `oldField` on the `Supplier` table.
  All data in that column will be lost.

? Do you want to continue? (y/N)
```

#### 2. שינוי סוג עמודה
```sql
-- מ-TEXT ל-INTEGER
ALTER TABLE "Item" ALTER COLUMN "quantity" TYPE INTEGER;
```
**תוצאה:** אם יש ערכים לא תואמים (כמו "abc"), זה ייכשל!

**הגנה:** תצטרך להמיר את הדאטה קודם או Prisma יזהיר אותך.

---

### ❌ שינויים שלא יקרו בטעות:

Prisma **לעולם לא יעשה** את זה אוטומטית:

```sql
❌ DROP DATABASE procurement;           -- מחיקת כל המסד
❌ DELETE FROM users;                    -- מחיקת כל המשתמשים
❌ TRUNCATE TABLE suppliers;            -- ריקון טבלה
❌ DROP TABLE purchase_orders;          -- מחיקת טבלה
```

**כדי לעשות את זה, תצטרך:**
1. לערוך את migration.sql ידנית
2. לאשר במפורש בקונסול
3. לדעת SQL

**אם אתה לא עושה את זה במכוון - זה לא יקרה!**

---

## 3 שכבות הגנה על הדאטה

### שכבה 1: Prisma Migrations (מבנה)
```
✅ רק שינויי מבנה בטוחים
✅ שומר דאטה קיימת
✅ שאלות לפני שינויים מסוכנים
```

### שכבה 2: גיבוי אוטומטי (קובץ)
```
✅ לפני כל עדכון: העתקה מלאה של procurement.db
✅ שמירה ב-C:\backups\procurement\
✅ ניתן לשחזר בכל רגע
```

### שכבה 3: Rollback (מערכת שלמה)
```
✅ אם משהו לא עובד → rollback אוטומטי
✅ אם גילית בעיה אחרי שעה → rollback ידני
✅ חזרה לגרסה שעבדה תוך דקה
```

**עם 3 השכבות האלה - הדאטה שלך בטוחה!**

---

## דוגמה מלאה: הוספת טבלת התראות

### תרחיש: אתה רוצה להוסיף מערכת התראות למשתמשים

**שלב 1: עדכון Schema**
```typescript
// prisma/schema.prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}

model User {
  id            String   @id
  email         String
  // ... שדות קיימים ...
  notifications Notification[]  // ← קשר חדש
}
```

**שלב 2: יצירת Migration**
```bash
npx prisma migrate dev --name add_notifications
```

Prisma יוצר:
```sql
-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
```

**שלב 3: בדיקה מקומית**
```bash
npm run dev
# בודק שהכל עובד
```

**שלב 4: פרסום גרסה**
```bash
npm run release:minor
# GitHub Actions בונה v1.2.0
```

**שלב 5: עדכון בייצור**
```powershell
.\update-production.ps1 -Version "1.2.0"
```

**מה קורה בשרת:**
```
[1/6] Creating backup...
  ✓ Backed up: C:\backups\procurement\v1.2.0-20251026-140500

[2/6] Downloading v1.2.0...
  ✓ Downloaded: 45 MB

[3/6] Stopping application...
  ✓ PM2 stopped

[4/6] Deploying files...
  ✓ Files updated
  ✓ .env preserved
  ✓ procurement.db preserved

[5/6] Running migrations...
  ⚙ Applying migration: 20251026_add_notifications
  ✓ Created table: Notification
  ✓ Created index: Notification_userId_idx
  ✓ Migrations complete

[6/6] Starting application...
  ✓ PM2 started
  ✓ Health check passed

✅ DEPLOYMENT SUCCESSFUL!
```

**התוצאה:**
```
Users טבלה (לא השתנתה!):
┌────┬──────────────┬──────────┐
│ id │ email        │ name     │
├────┼──────────────┼──────────┤
│ 01 │ user@test.com│ משתמש א  │ ← הדאטה בדיוק כמו שהייתה!
└────┴──────────────┴──────────┘

Notification טבלה (חדשה!):
┌────┬────────┬─────────┬────────┐
│ id │ userId │ message │ isRead │
├────┼────────┼─────────┼────────┤
│    │        │         │        │ ← ריקה, מוכנה לשימוש
└────┴────────┴─────────┴────────┘
```

---

## שאלות ותשובות

### ש: מה קורה אם אני מחליט למחוק טבלה ישנה?

**ת:** Prisma ישאל אותך במפורש:
```
⚠ You are about to drop the `OldTable` table.
  This will delete all data in the table.

? Are you sure? (y/N)
```

אם אתה לא מקליד "y" במפורש - זה לא יקרה.

בנוסף, לפני העדכון בייצור יש גיבוי מלא, אז גם אם טעית - תוכל לשחזר.

---

### ש: מה אם migration נכשל באמצע?

**ת:** Prisma משתמש ב-transactions. אם migration נכשל, הכל חוזר למצב קודם:
```
⚙ Running migration...
❌ Error: Cannot convert TEXT to INTEGER
🔄 Rolling back changes...
✅ Database unchanged
```

**אף שינוי לא יישמר אם migration נכשל!**

---

### ש: האם אני צריך לדאוג למשהו?

**ת:** ברוב המקרים - לא!

פשוט:
1. עשה את השינויים בschema.prisma
2. הרץ `npx prisma migrate dev`
3. בדוק מקומית
4. פרסם גרסה

הסקריפטים שלנו דואגים לשאר.

**דברים היחידים שצריך לשים לב אליהם:**
- ⚠️ מחיקת עמודות/טבלאות - Prisma ישאל אותך
- ⚠️ שינוי טיפוסים - בדוק שהדאטה תואמת

**כל השאר בטוח לחלוטין!**

---

## סיכום

✅ **Prisma Migrations בטוחים** - הם רק משנים מבנה, לא מוחקים דאטה

✅ **יש גיבוי אוטומטי** - לפני כל עדכון

✅ **יש rollback** - אוטומטי ו/או ידני

✅ **תהליך בדוק** - משמש בהמוני אפליקציות בעולם

✅ **שקיפות מלאה** - כל migration שמור כקובץ SQL שאפשר לקרוא

**אתה יכול לעדכן בביטחון! 🚀**

---

**לקריאה נוספת:**
- [תהליך הפריסה המלא](DEPLOYMENT-PROCESS.md)
- [מדריך מהיר](QUICK-START.md)
- [פתרון בעיות](TROUBLESHOOTING.md)

**תיעוד רשמי של Prisma:**
https://www.prisma.io/docs/concepts/components/prisma-migrate
