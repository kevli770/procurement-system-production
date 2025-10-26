# Product Requirements Document (PRD)
# מערכת רכש - Procurement System

**Version:** 1.0
**Date:** 2025-10-20
**Owner:** CTO
**Target Users:** IT Department (~40 users)

---

## 1. Executive Summary

### 1.1 Purpose
מערכת רכש פנימית לניהול תקציב ועלויות עבור מחלקת IT בארגון גדול בישראל. המערכת תטפל במאות חשבוניות חודשיות ותנהל את תהליך האישור מהמשתמש ועד לפיננסים.

### 1.2 Problem Statement
כיום:
- מאות חשבוניות מטופלות ידנית כל חודש
- אין שליטה מרכזית על תקציבים והוצאות
- תהליך אישור לא אוטומטי ולא שקוף
- אין אפשרות לדוחות ואנליטיקה בזמן אמת
- אין מעקב אחר ספקים והוצאות לפי משתמשים

### 1.3 Goals
1. **ייעול תהליך הרכש**: הפחתת זמן טיפול בהזמנת רכש מ-XX דקות ל-YY דקות
2. **שליטה בתקציב**: מניעת חריגות תקציב באמצעות הגדרת מסגרות והיררכיית אישורים
3. **שקיפות**: מעקב בזמן אמת אחר כל הזמנות הרכש והוצאות
4. **אוטומציה**: יצירה אוטומטית של מסמכי אישור ושליחה לספקים
5. **דיווח ואנליטיקה**: יכולת ניתוח עלויות לפי ממדים שונים

---

## 2. Target Audience

### 2.1 Primary Users
- **40 משתמשים** במחלקת IT
- **תפקידים**: מנהלים, טכנאים, רכזי רכש
- **רמות הרשאה**: 4 רמות היררכיות של אישור

### 2.2 User Personas

#### Persona 1: רכז רכש (Procurement Coordinator)
- **צרכים**: יצירת הזמנות רכש במהירות, מעקב אחר סטטוס
- **כאבים**: הזנה ידנית חוזרת, אי בהירות לגבי סטטוס אישורים
- **מגבלות**: הרשאה עד X ₪ בלבד

#### Persona 2: מנהל (Manager)
- **צרכים**: אישור הזמנות, מעקב אחר הוצאות הצוות
- **כאבים**: עומס אישורים, חוסר נראות לעלויות מצטברות
- **מגבלות**: הרשאה עד XX ₪

#### Persona 3: מנהל בכיר / CTO
- **צרכים**: דוחות אנליטיים, התראות על חריגות, אישורים סופיים
- **כאבים**: חוסר מידע מרוכז, גילוי חריגות רק בדיעבד
- **מגבלות**: הרשאה ללא הגבלה

#### Persona 4: מנהל מערכת (Admin)
- **צרכים**: ניהול קטלוג פריטים, משתמשים, ספקים
- **כאבים**: אין כלי ניהול מרכזי
- **מגבלות**: גישה מלאה לכל המערכת

---

## 3. Feature Requirements

### 3.1 Core Features (Must Have - MVP)

#### F1: קטלוג פריטים (Items Catalogue)
**Priority:** P1 - Critical

**Description:**
מאגר מרכזי של כל הפריטים והשירותים שניתן לרכוש במערכת.

**User Stories:**
- US1.1: כמנהל מערכת, אני רוצה ליצור פריט חדש בקטלוג כדי שמשתמשים יוכלו להזמין אותו
- US1.2: כמנהל מערכת, אני רוצה לערוך פריט קיים כדי לעדכן מחירים או מפרט
- US1.3: כמשתמש, אני רוצה לחפש ולמצוא פריטים בקלות כדי להוסיף להזמנה
- US1.4: כמנהל מערכת, אני רוצה להגדיר תוקף לפריט (from-to) כדי לנהל פריטים עונתיים

**Acceptance Criteria:**
- פריט כולל את כל השדות הנדרשים (Name, Description, Character1-3, Price, Period, Supplier, SKU, Remarks)
- SKU נוצר אוטומטית על ידי המערכת
- תמיכה ב-3 Character lists דינמיות (configurable)
- Character1: Service / Item / Manpower (רשימה דינמית)
- תוקף: from-to dates או one-time purchase (default)
- חיפוש מהיר בשם/תיאור/SKU

**Technical Notes:**
- SKU format: להחליט על פורמט (דוגמה: YEAR-CATEGORY-SEQUENCE)
- Dynamic lists: טבלאות נפרדות עם יכולת הוספה/עריכה

---

#### F2: ניהול ספקים (Suppliers Management)
**Priority:** P1 - Critical

**Description:**
מאגר ספקים עם כל הפרטים הרלוונטיים לתקשורת ותשלום.

**User Stories:**
- US2.1: כמנהל מערכת, אני רוצה להוסיף ספק חדש עם כל הפרטים כדי שניתן יהיה להזמין ממנו
- US2.2: כמשתמש, אני רוצה לבחור ספק מרשימה בעת יצירת הזמנה
- US2.3: כמערכת, אני רוצה לשלוח הזמנות מאושרות לספק אוטומטית למייל

**Acceptance Criteria:**
- שדות סטנדרטיים: שם, כתובת, טלפון, אימייל, ח.פ/ע.מ, איש קשר, הערות
- ספק חייב לכלול אימייל תקין לשליחת הזמנות
- אפשרות לסמן ספק כלא פעיל (soft delete)

---

#### F3: ניהול משתמשים והרשאות (Users & Permissions)
**Priority:** P1 - Critical

**Description:**
ניהול משתמשים עם הגדרת מסגרות אישור והיררכיה ניהולית.

**User Stories:**
- US3.1: כמנהל מערכת, אני רוצה להגדיר משתמש חדש עם מסגרת אישור כדי לשלוט בהוצאות
- US3.2: כמנהל מערכת, אני רוצה להגדיר היררכיה (מי מדווח למי) כדי לנתב אישורים
- US3.3: כמשתמש, אני רוצה לראות רק הזמנות שרלוונטיות לי (שלי או שאני צריך לאשר)

**Acceptance Criteria:**
- שדות משתמש: שם, אימייל, מסגרת אישור (סכום מקסימלי), מנהל ישיר
- תמיכה ב-4 רמות אישור (עד 4 שלבים)
- Integration עם Clerk לאימות
- כל משתמש רואה שם משתמש בכותרת המערכת

**Technical Notes:**
- Clerk מספק authentication, אבל authorization והרשאות יהיו במערכת
- שקול: האם להשתמש ב-Clerk Organizations או לנהול בעצמך

---

#### F4: יצירת הזמנת רכש (Create Purchase Order)
**Priority:** P1 - Critical

**Description:**
תהליך יצירת הזמנת רכש חדשה עם כותרת ושורות פריטים.

**User Stories:**
- US4.1: כמשתמש, אני רוצה לפתוח הזמנת רכש חדשה ולבחור ספק
- US4.2: כמשתמש, אני רוצה להוסיף פריטים מהקטלוג להזמנה
- US4.3: כמשתמש, אני רוצה לערוך מחיר וכמות לכל פריט
- US4.4: כמשתמש, אני רוצה לראות סכום כולל של ההזמנה בזמן אמת
- US4.5: כמשתמש, אני רוצה לשמור הזמנה כטיוטה ולחזור לערוך אותה מאוחר יותר

**Acceptance Criteria:**

**Header Fields:**
- ספק (בחירה מרשימה)
- תאריך
- חברה מרכזית (בחירה מרשימה של חברות בקבוצה)
- הערות (אופציונלי)

**Line Items:**
- בחירת פריט מקטלוג - מושך אוטומטית: שם, תיאור, מחיר מומלץ, characters
- שדות לעריכה: מחיר, כמות
- חישוב אוטומטי: סכום לשורה (מחיר × כמות)
- הצגת characters של הפריט

**Totals:**
- סכום כולל עבור כל שורות ההזמנה
- תמיכה במטבע: ₪ (שקלים)

**Status Flow:**
- Draft → יכול לערוך ולשמור
- Final → לא יכול לערוך, ממתין לאישור אוטומטי/ידני
- Approved → נעול לעריכה
- Pending Approval → נעול לעריכה, ממתין למאשר
- Cancelled → נעול לעריכה

---

#### F5: תהליך אישור אוטומטי (Automatic Approval Workflow)
**Priority:** P1 - Critical

**Description:**
אישור אוטומטי או ניתוב למאשר לפי מסגרת ההרשאה.

**User Stories:**
- US5.1: כמשתמש, אני רוצה שהזמנות בגבול המסגרת שלי יאושרו אוטומטית
- US5.2: כמשתמש, אני רוצה שהזמנות מעל המסגרת ינותבו למנהל שלי
- US5.3: כמנהל, אני רוצה לראות רשימת הזמנות הממתינות לאישור שלי
- US5.4: כמנהל, אני רוצה לאשר או לדחות הזמנה בקליק אחד

**Acceptance Criteria:**
- אם סכום ≤ מסגרת משתמש → סטטוס "Approved" אוטומטית
- אם סכום > מסגרת משתמש → סטטוס "Pending Approval", נשלח למנהל ישיר
- תמיכה עד 4 רמות אישור (כל רמה בודקת מסגרת של המאשר)
- מאשר רואה את ההזמנה עם כל הפרטים ויכול: לאשר / לדחות / להעביר למנהל שלו
- התראה למאשר (אימייל/UI notification) על הזמנה חדשה

**Technical Notes:**
- צריך להגדיר: מה קורה אם אין מנהל ישיר? (שגיאה / אישור אוטומטי / ניתוב ל-admin)
- שקול: האם מאשר יכול לערוך את ההזמנה או רק לאשר/לדחות

---

#### F6: ניהול הזמנות (Purchase Orders Management)
**Priority:** P1 - Critical

**Description:**
רשימת כל הזמנות הרכש עם אפשרויות צפייה, עריכה, חיפוש וסינון.

**User Stories:**
- US6.1: כמשתמש, אני רוצה לראות רשימת כל ההזמנות שלי וההזמנות שאני צריך לאשר
- US6.2: כמשתמש, אני רוצה לחפש הזמנות לפי מספר, ספק, תאריך, סטטוס
- US6.3: כמשתמש, אני רוצה לסנן הזמנות לפי סטטוס
- US6.4: כמשתמש, אני רוצה ללחוץ על הזמנה ולפתוח אותה לעריכה (אם מותר)

**Acceptance Criteria:**
- טבלה עם עמודות: מספר הזמנה, תאריך, ספק, חברה, סכום, סטטוס, פעולות
- חיפוש מהיר בכל השדות
- סינון לפי: סטטוס, ספק, טווח תאריכים, חברה
- מיון לפי כל עמודה
- לחיצה על שורה → פתיחת ההזמנה
- כפתור "הזמנה חדשה" בולט

**View Permissions:**
- כל משתמש רואה:
  - הזמנות שהוא יצר
  - הזמנות שממתינות לאישור שלו
- Admin רואה הכל

---

#### F7: Dashboard ו-Analytics
**Priority:** P1 - Critical

**Description:**
לוח בקרה עם מדדים ואנליטיקה על הזמנות והוצאות.

**User Stories:**
- US7.1: כמשתמש, אני רוצה לראות dashboard עם סטטיסטיקות על ההזמנות שלי
- US7.2: כמנהל, אני רוצה לראות הוצאות הצוות שלי חודש זה
- US7.3: כמנהל, אני רוצה לקבל התראה אם ספק עבר 100,000 ₪ בחודש
- US7.4: כמשתמש, אני רוצה לראות דוחות לפי: משתמש, ספק, תקופה, חברה

**Acceptance Criteria:**

**Dashboard Widgets:**
- סך הוצאות חודש זה / רבעון / שנה
- מספר הזמנות לפי סטטוס (Approved, Pending, Draft)
- Top 5 ספקים לפי סכום
- התפלגות עלויות לפי חברה
- התפלגות לפי Character1 (Service/Item/Manpower)

**Alerts:**
- התראה אדומה אם ספק עבר 100,000 ₪ בחודש נוכחי
- התראה צהובה אם ספק קרוב ל-80,000 ₪

**Smart Reports:**
- פילטרים: משתמש, ספק, טווח תאריכים, חברה, סטטוס
- יצוא לדוח: Excel / PDF
- גרפים: עמודות, עוגה, קו (לפי תקופה)

**Technical Notes:**
- צריך indexing טוב לשאילתות מהירות
- שקול: caching עבור דשבורד (refresh כל 5 דקות)

---

#### F8: יצירת מסמך Cash Pay
**Priority:** P1 - Critical

**Description:**
כאשר הזמנה מאושרת, המערכת יוצרת מסמך "Cash Pay" להדפסה ולחתימה.

**User Stories:**
- US8.1: כמערכת, אני רוצה ליצור Cash Pay אוטומטית כשהזמנה עוברת ל-Approved
- US8.2: כמשתמש, אני רוצה להדפיס Cash Pay כשהחשבונית מגיעה
- US8.3: כמאשר, אני רוצה לראות מקום לחתימה על ה-Cash Pay

**Acceptance Criteria:**
- Cash Pay כולל:
  - כל הפרטים מההזמנה (header + line items)
  - לוגו של החברה (אם הועלה)
  - מקום ייעודי לחתימת המאשר (שם + תאריך)
- פורמט: PDF להדפסה
- שמירה אוטומטית במערכת (קישור מההזמנה)
- כפתור "הדפס Cash Pay" בתצוגת ההזמנה

---

### 3.2 Additional Features (Should Have)

#### F9: שליחת PDF לספק ומשתמש
**Priority:** P2 - High

**Description:**
שליחת PDF אוטומטית של ההזמנה המאושרת לספק ולמשתמש.

**User Stories:**
- US9.1: כמערכת, אני רוצה לשלוח PDF של ההזמנה לספק כשהיא מאושרת
- US9.2: כמערכת, אני רוצה לשלוח העתק למשתמש שיצר את ההזמנה

**Acceptance Criteria:**
- שליחת אימייל אוטומטית לאחר אישור סופי
- אימייל כולל:
  - PDF מצורף של ההזמנה
  - הודעה מותאמת (ספק / משתמש)
- רישום log של שליחת אימייל (הצלחה/כשלון)

---

#### F10: Backup & Restore
**Priority:** P2 - High

**Description:**
יכולת גיבוי ושחזור של כל הנתונים.

**User Stories:**
- US10.1: כמנהל מערכת, אני רוצה לגבות את כל הנתונים לקובץ
- US10.2: כמנהל מערכת, אני רוצה לשחזר מגיבוי קודם

**Acceptance Criteria:**
- כפתור "Backup Now" בממשק Admin
- יצירת קובץ JSON/SQLite עם כל הנתונים
- שמירה local עם timestamp
- כפתור "Restore from Backup" - בחירת קובץ גיבוי
- אישור לפני שחזור (מחיקת נתונים קיימים)

**Technical Notes:**
- גיבוי צריך לכלול: Users, Items, Suppliers, POs, Companies, Config
- שקול: גיבוי אוטומטי יומי

---

#### F11: העלאת לוגו
**Priority:** P3 - Nice to Have

**Description:**
יכולת להעלות לוגו שיופיע על הזמנות ו-Cash Pay.

**User Stories:**
- US11.1: כמנהל מערכת, אני רוצה להעלות לוגו של החברה

**Acceptance Criteria:**
- בממשק Admin: כפתור "Upload Logo"
- תמיכה בפורמטים: PNG, JPG, SVG
- גודל מקסימלי: 2MB
- תצוגה מקדימה לפני שמירה
- לוגו מופיע בכותרת של הזמנות ו-Cash Pay

---

#### F12: רב לשוניות (Hebrew & English)
**Priority:** P2 - High

**Description:**
תמיכה בעברית ואנגלית.

**User Stories:**
- US12.1: כמשתמש, אני רוצה לבחור שפה בממשק

**Acceptance Criteria:**
- בחירת שפה בכותרת (דגל/dropdown)
- כל הטקסטים מתורגמים
- תמיכה ב-RTL לעברית
- שמירת העדפת שפה per user

**Technical Notes:**
- Next.js i18n / react-i18next
- קבצי תרגום: en.json, he.json

---

### 3.3 Technical Requirements

#### T1: Local Deployment
**Priority:** P1 - Critical

**Challenge:**
המערכת צריכה להיות מותקנת locally על שרתים/מחשבים של החברה, אבל Clerk הוא שירות cloud.

**Options:**
1. **Option A**: להשתמש ב-Clerk בכל זאת (hybrid: auth ב-cloud, data local)
2. **Option B**: להחליף Clerk ב-NextAuth.js (local auth לחלוטין)
3. **Option C**: להשתמש ב-Clerk Development mode עם self-hosted backend

**Recommendation:** [NEEDS CLARIFICATION - ראה סעיף 6]

---

#### T2: Database
**Priority:** P1 - Critical

**Requirement:** "All data should be stored and backed up in a local file (acting as a database)"

**Options:**
1. **SQLite**: קובץ DB יחיד, מתאים ל-40 משתמשים, backup/restore קל
2. **JSON Files**: פשוט מאוד, אבל לא מתאים לשאילתות מורכבות
3. **PostgreSQL local**: עוצמתי יותר, אבל דורש setup

**Recommendation:** SQLite עם Prisma ORM

---

#### T3: PDF Generation
**Priority:** P1 - Critical

**Libraries:**
- jsPDF או Puppeteer או @react-pdf/renderer

---

#### T4: Email Service
**Priority:** P2 - High

**Challenge:** שליחת אימיילים ב-local deployment

**Options:**
1. SMTP של החברה (אם יש)
2. Local mail server (MailHog לפיתוח)
3. Gmail SMTP (פחות מומלץ לארגוני)

**Recommendation:** [NEEDS CLARIFICATION - ראה סעיף 6]

---

## 4. User Flows

### 4.1 Main Flow: יצירת הזמנת רכש והאישור

```
[User] → Login (Clerk)
   ↓
[Dashboard] → "New Purchase Order"
   ↓
[PO Form - Header]
   • Select Supplier ← [Suppliers DB]
   • Select Company ← [Companies List]
   • Enter Date
   • Add Remarks
   ↓
[PO Form - Line Items]
   • Search & Select Item ← [Items Catalogue]
   • System auto-fills: Name, Price, Characters
   • User edits: Price, Quantity
   • Calculate Line Total
   • Add more lines...
   ↓
[PO Form - Review]
   • View Total Amount
   • Save as Draft (can edit later) → END
   • OR: Mark as Final → Continue
   ↓
[Approval Logic]
   IF Total ≤ User's Limit:
      → Status = "Approved" (automatic)
      → Generate Cash Pay PDF
      → Send PDF to Supplier & User (email)
      → END
   ELSE:
      → Status = "Pending Approval"
      → Route to Manager
      ↓
      [Manager] Receives notification
      [Manager] Reviews PO
         • Approve → IF within Manager's limit → "Approved"
                      ELSE → Route to next level (up to 4 levels)
         • Reject → Status = "Rejected", notify User
         • Cancel → Status = "Cancelled"
```

---

### 4.2 Admin Flow: ניהול קטלוג פריטים

```
[Admin] → Login
   ↓
[Admin Panel] → "Manage Items"
   ↓
[Items List] → View all items (table with filters)
   ↓
[Add New Item]
   • Enter: Name, Description
   • Select: Character1 (Service/Item/Manpower) ← [Dynamic List]
   • Select: Character2 ← [Dynamic List]
   • Select: Character3 ← [Dynamic List]
   • Enter: Suggested Price
   • Select: Period (One-time / From-To dates)
   • Select: Supplier ← [Suppliers List]
   • Auto-generate SKU
   • Enter: Remarks
   ↓
Save → [Items DB]
```

---

## 5. Success Metrics

### 5.1 Quantitative Metrics

1. **Time Savings:**
   - Reduction in time to create PO: from XX minutes to YY minutes (target: 50% reduction)
   - Reduction in approval time: from XX days to YY hours

2. **Error Reduction:**
   - Reduction in manual errors (missing fields, wrong prices): target 90% reduction

3. **Visibility:**
   - 100% of spending visible in real-time
   - Monthly supplier spending alerts: 100% coverage

4. **User Adoption:**
   - 100% of IT team using the system within 2 months
   - <5% of POs created outside the system

### 5.2 Qualitative Metrics

1. **User Satisfaction:**
   - User feedback: "easy to use", "saves time"
   - Reduction in support tickets related to procurement

2. **Financial Control:**
   - No budget overruns without explicit approval
   - Early detection of spending anomalies (supplier >100K/month)

---

## 6. Open Questions & Clarifications Needed

### Q1: Authentication & Local Deployment

**Context:** הדרישה היא "secure and installed locally on our servers/computers", אבל Clerk הוא שירות cloud authentication.

**Question:** איך אתה מעדיף לטפל באימות משתמשים?

| Option | Answer | Implications |
|--------|--------|--------------|
| A | להשתמש ב-Clerk (hybrid: auth ב-cloud, data local) | + קל לממש (כבר מותקן), + תכונות מתקדמות (MFA, social login)<br>- תלות בשירות חיצוני, - חלק מה-auth data ב-cloud |
| B | להחליף ל-NextAuth.js (auth local לחלוטין) | + שליטה מלאה, + הכל local<br>- צריך לממש מחדש, - פחות תכונות מובנות |
| C | להשאיר Clerk רק לפיתוח, לתכנן מעבר ל-local auth בעתיד | + מהיר להתחיל<br>- עבודה כפולה בעתיד |
| Custom | ספר לי מה אתה מעדיף | - |

**Your choice:** _____

---

### Q2: Email Service for Sending POs

**Context:** המערכת צריכה לשלוח PDFs של הזמנות מאושרות לספקים ולמשתמשים.

**Question:** איך תרצה לשלוח אימיילים?

| Option | Answer | Implications |
|--------|--------|--------------|
| A | להשתמש ב-SMTP של החברה (Exchange / Gmail for Business) | + נראה כמגיע מהחברה, + בטוח<br>- צריך credentials מה-IT |
| B | לא לשלוח אוטומטית, רק לאפשר "Export PDF" ידני | + פשוט, אין תלות<br>- לא אוטומטי, מפחית ערך |
| C | להשתמש בשירות חיצוני (SendGrid / Resend) | + קל לממש<br>- תלות בשירות חיצוני, עלות |
| Custom | פתרון אחר | - |

**Your choice:** _____

---

### Q3: Approval Hierarchy - Edge Cases

**Context:** יש עד 4 רמות אישור, אבל מה קורה במצבים חריגים?

**Question:** איך לטפל במקרים הבאים?

**3a. משתמש ללא מנהל ישיר:**
- A: שגיאה - חובה להגדיר מנהל
- B: אישור אוטומטי
- C: ניתוב ל-admin/CTO

**3b. מאשר יכול לערוך את ההזמנה:**
- A: מאשר יכול רק לאשר/לדחות (לא לערוך)
- B: מאשר יכול לערוך ואז לאשר
- C: מאשר יכול לבקש שינויים, משתמש עורך

**3c. מה קורה אם כל 4 הרמות אישרו והסכום עדיין גדול מהמסגרת האחרונה:**
- A: נדרש אישור ידני מחוץ למערכת
- B: הרמה ה-4 חייבת להיות ללא הגבלה (CTO)
- C: שגיאה - אי אפשר להגיש הזמנה כזו

**Your choices:** 3a: ___ | 3b: ___ | 3c: ___

---

### Q4: Companies in Group

**Context:** הוזכר "we have several companies in the group", אבל לא ברור כמה וכיצד זה משפיע.

**Question:** כמה חברות יש בקבוצה ואיך זה משפיע על המערכת?

| Option | Answer | Implications |
|--------|--------|--------------|
| A | 2-3 חברות, רק לצורך רישום בהזמנה (איזו חברה לחייב) | + פשוט: רק רשימה להבחרה<br>- לא צריך הפרדת תקציבים |
| B | 5-10 חברות, כל חברה עם תקציב נפרד | + שליטה: מעקב תקציב per חברה<br>- מורכב: צריך ניהול תקציבים, דוחות per חברה |
| C | רק חברה אחת כרגע, אבל צריך להכין ל-multi-company בעתיד | + גמישות<br>- תכנון מורכב יותר |
| Custom | מספר אחר / הסבר נוסף | - |

**Your choice:** _____

---

## 7. Assumptions

1. **Technology Stack:** Next.js, Tailwind CSS, ShadCN UI, Clerk (או NextAuth), Lucide Icons - כבר מותקנים
2. **Users:** 40 משתמשים במחלקת IT, לא יותר מ-10 concurrent בו זמנית
3. **Volume:** מאות חשבוניות בחודש = ~5-10 הזמנות ביום
4. **Currency:** רק ₪ (שקלים), לא multi-currency
5. **Taxes:** לא צריך חישוב מע"מ (נעשה בפיננסים)
6. **Hosting:** Local server עם Windows/Linux, לא cloud
7. **Browser Support:** Chrome, Edge, Firefox (לא IE)
8. **Mobile:** אופציונלי, אבל responsive design

---

## 8. Out of Scope (Not in MVP)

1. **Integration עם מערכות חשבונאיות** (SAP, Priority) - לא בשלב ראשון
2. **Mobile App** ייעודי (רק web responsive)
3. **Notifications בפוש** (רק אימייל)
4. **ניהול מלאי** (המערכת לא עוקבת אחר stock)
5. **Multi-tenancy** (רק ארגון אחד)
6. **Advanced Analytics** (ML, predictions) - רק דוחות בסיסיים
7. **E-signature integration** (DocuSign) - רק חתימה ידנית על print
8. **Supplier Portal** (ספקים לא נכנסים למערכת)

---

## 9. Timeline & Milestones

### Phase 1: MVP (6-8 weeks)
- Week 1-2: תכנון וסכמת DB
- Week 3-4: Backend + Auth + Admin (Items, Suppliers, Users)
- Week 5-6: PO Creation + Approval Logic
- Week 7-8: Dashboard + Reports + Testing

### Phase 2: Enhancement (2-3 weeks)
- Email automation
- PDF generation (Cash Pay)
- Backup/Restore
- Hebrew localization

### Phase 3: Polish (1-2 weeks)
- UX improvements
- Performance optimization
- User training & documentation

---

## 10. Risks & Mitigation

### Risk 1: Clerk incompatibility with local deployment
**Impact:** High
**Probability:** Medium
**Mitigation:** Decision needed (see Q1), fallback to NextAuth.js

### Risk 2: Email delivery issues
**Impact:** Medium
**Probability:** Medium
**Mitigation:** Manual PDF export as fallback, SMTP testing early

### Risk 3: User adoption resistance
**Impact:** High
**Probability:** Low
**Mitigation:** User training, simple UX, admin champions

### Risk 4: Data migration from current process
**Impact:** Medium
**Probability:** High (if they have historical data)
**Mitigation:** Import tool for historical POs (optional)

---

## 11. Appendix

### A. Glossary

- **PO (Purchase Order):** הזמנת רכש
- **Cash Pay:** מסמך אישור לתשלום
- **SKU (Stock Keeping Unit):** מזהה ייחודי לפריט
- **Approval Limit:** מסגרת אישור (סכום מקסימלי)
- **Hierarchy:** היררכיה ניהולית (מי מדווח למי)

### B. References

- [Next.js Documentation](https://nextjs.org/docs)
- [ShadCN UI Components](https://ui.shadcn.com/)
- [Clerk Authentication](https://clerk.com/docs)
- [Prisma ORM](https://www.prisma.io/docs)

---

**Document Status:** Draft
**Next Steps:**
1. Review Q1-Q4 and provide answers
2. Generate Technical Specification (SPEC.md)
3. Create Implementation Plan (tasks.md)
