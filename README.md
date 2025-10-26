# Procurement Management System - Production

![Version](https://img.shields.io/github/v/release/kevli770/procurement-system-production)
![Build](https://img.shields.io/github/actions/workflow/status/kevli770/procurement-system-production/release.yml)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

מערכת ניהול רכש מקצועית עם תהליך פריסה אוטומטי לסביבת ייצור.

---

## 📖 תיאור

מערכת מקיפה לניהול תהליכי רכש בארגון, הכוללת:
- ניהול ספקים ופריטים
- יצירת והתעדכן הזמנות רכש
- תהליכי אישור רב-שלביים
- יצירת מסמכי תשלום (CashPay)
- דוחות ומעקבים
- רב-לשוניות (עברית/אנגלית)

**טכנולוגיות:**
- Next.js 15 (React 19)
- TypeScript
- Prisma ORM + SQLite
- NextAuth.js
- TailwindCSS + shadcn/ui
- PM2 + IIS

---

## 🚀 התחלה מהירה

### למפתחים - פרסום גרסה חדשה

```bash
# פיצ'ר חדש
npm run release:minor

# תיקון באג
npm run release:patch
```

**GitHub Actions יעשה את השאר אוטומטית!**

### לאנשי מערכת - עדכון בשרת

```powershell
.\update-production.ps1 -Version "1.2.0"
```

**הסקריפט יטפל בכל השאר!**

[📘 מדריך מלא >>](QUICK-START.md)

---

## 📚 תיעוד

| מסמך | תיאור |
|------|--------|
| **[מדריך מהיר](QUICK-START.md)** | 2 דקות להבנת התהליך |
| **[תהליך פריסה](DEPLOYMENT-PROCESS.md)** | SOP מלא (ניתן לשימוש חוזר) |
| **[אבטחת DB](DATABASE-MIGRATIONS-EXPLAINED.md)** | למה הדאטה בטוחה |
| **[פתרון בעיות](TROUBLESHOOTING.md)** | בעיות נפוצות ופתרונות |

---

## ⚡ תכונות עיקריות

### אבטחה וגיבויים
- ✅ **גיבוי אוטומטי** לפני כל עדכון
- ✅ **Rollback אוטומטי** אם משהו נכשל
- ✅ **Prisma Migrations** שמירת דאטה 100%
- ✅ **Health checks** אוטומטיים

### פריסה אוטומטית
- ✅ **GitHub Actions** - build אוטומטי
- ✅ **PowerShell scripts** - עדכון בלחיצת כפתור
- ✅ **Zero-downtime** (1-2 דקות)
- ✅ **Version management** - semantic versioning

### תיעוד מקיף
- ✅ **מדריכים בעברית** - פשוטים ומעשיים
- ✅ **SOP לשימוש חוזר** - לאפליקציות נוספות
- ✅ **Troubleshooting** - פתרונות מוכנים

---

## 🔄 תהליך העבודה

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   מפתח       │────▶│   GitHub     │────▶│  איש מערכת   │
│ npm run      │     │   Actions    │     │  update      │
│ release      │     │   Build      │     │  script      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   ▼
                                           ┌──────────────┐
                                           │    שרת       │
                                           │  גיבוי +     │
                                           │  עדכון       │
                                           └──────────────┘
                                                   │
                                                   ▼
                                           ┌──────────────┐
                                           │ Health Check │
                                           └──────────────┘
                                              ✅      ❌
                                              │       │
                                          Success  Rollback
```

---

## 📦 מבנה הפרויקט

```
procurement-system-production/
├── .github/workflows/        # GitHub Actions
│   └── release.yml           # Automated build & release
├── src/                      # Application code
│   ├── app/                  # Next.js app router
│   ├── components/           # React components
│   └── lib/                  # Utilities
├── prisma/                   # Database
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
├── deployment/               # Deployment scripts
│   ├── update-production.ps1 # Update script
│   ├── rollback-production.ps1 # Rollback script
│   └── backup-config.json    # Backup settings
├── docs/                     # Documentation
├── QUICK-START.md            # Quick guide
├── DEPLOYMENT-PROCESS.md     # Full SOP
├── DATABASE-MIGRATIONS-EXPLAINED.md # DB safety
└── TROUBLESHOOTING.md        # Common issues
```

---

## 🛠️ התקנה והפעלה

### דרישות מערכת

**סביבת פיתוח:**
- Node.js 20 LTS
- npm 10+
- Git

**סביבת ייצור:**
- Windows Server 2019+
- Node.js 20 LTS
- PM2
- IIS 10+ (אופציונלי)

### התקנה ראשונית

```bash
# Clone repository
git clone https://github.com/kevli770/procurement-system-production.git
cd procurement-system-production

# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev
```

האפליקציה תהיה זמינה ב: http://localhost:3000

---

## 🔐 אבטחה

### הגנת דאטה - 3 שכבות

1. **Prisma Migrations**
   - שינויים בטוחים למבנה DB בלבד
   - לא מוחק דאטה קיימת
   - כל שינוי מתועד

2. **גיבוי אוטומטי**
   - לפני כל עדכון
   - שמירת 10 גרסאות
   - כולל קובץ DB

3. **Rollback**
   - אוטומטי אם נכשל health check
   - ידני לכל גרסה קודמת
   - שחזור מלא תוך דקה

[📖 קרא עוד על אבטחת DB >>](DATABASE-MIGRATIONS-EXPLAINED.md)

---

## 📊 Releases

כל release כולל:
- ✅ Next.js standalone build מאופטם
- ✅ Prisma schema + migrations
- ✅ סקריפטי deployment
- ✅ קבצי קונפיגורציה (PM2, IIS)
- ✅ Release notes אוטומטיים

**גרסאות אחרונות:**

[🔗 ראה כל ה-Releases >>](https://github.com/kevli770/procurement-system-production/releases)

---

## 🤝 תרומה לפרויקט

### Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Standards

- TypeScript strict mode
- ESLint + Prettier
- Semantic versioning
- Conventional commits

---

## 📝 Changelog

### [v0.1.0] - 2025-10-26
- ✨ Initial production deployment setup
- ✨ GitHub Actions workflow
- ✨ Automated deployment scripts
- ✨ Comprehensive documentation
- ✨ Database safety measures
- ✨ Rollback capabilities

[📖 Full Changelog >>](https://github.com/kevli770/procurement-system-production/releases)

---

## 🆘 תמיכה

### יש בעיה?

1. **בדוק את [פתרון הבעיות](TROUBLESHOOTING.md)**
2. **חפש ב-[Issues](https://github.com/kevli770/procurement-system-production/issues)**
3. **פתח Issue חדש** עם:
   - תיאור הבעיה
   - שלבים לשחזור
   - לוגים רלוונטיים

### שאלות?

- 💬 [Discussions](https://github.com/kevli770/procurement-system-production/discussions)

---

## 📄 רישיון

This project is licensed under the MIT License.

---

## 👏 תודות

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [PM2](https://pm2.keymetrics.io/)

---

## 📞 יצירת קשר

**Project Link:** [https://github.com/kevli770/procurement-system-production](https://github.com/kevli770/procurement-system-production)

---

**Built with ❤️ for efficient procurement management**
