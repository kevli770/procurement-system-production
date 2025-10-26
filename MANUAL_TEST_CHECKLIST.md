# Quick Manual Testing Checklist

## 🎯 Priority Tests (Do These First!)

Open the app at http://localhost:3002 and follow this checklist:

### 1. Can you access the app?
- [ ] Navigate to http://localhost:3002
- [ ] Does it redirect to /login?
- [ ] Login page displays correctly in Hebrew RTL?

### 2. Can you log in?
- [ ] Try logging in (do you have a user created?)
- [ ] Does it redirect to /dashboard after login?
- [ ] Dashboard loads without errors?

### 3. Basic Navigation
- [ ] Click on "הזמנות רכש" (Purchase Orders) in sidebar
- [ ] Click on "לוח בקרה" (Dashboard) in sidebar
- [ ] Do the pages load?
- [ ] Are there any console errors? (F12 → Console tab)

### 4. Can you create a test user?
First, we need to check if you have any users in the database.

Run this command:
```bash
npx prisma studio
```

This will open Prisma Studio at http://localhost:5555 where you can:
- View all tables
- See if you have users
- Create a test user manually if needed

**Test user to create**:
- Email: admin@test.com
- Name: Admin Test
- Role: SUPER_ADMIN
- Password: (you'll need to hash it - see below)

### 5. Create Test Data
You need at least:
- [ ] 1 SUPER_ADMIN user
- [ ] 1 MANAGER user
- [ ] 1 USER user
- [ ] 2-3 Companies
- [ ] 2-3 Suppliers
- [ ] 5-10 Items in catalogue
- [ ] 1 Character with manager hierarchy

---

## 🔍 Common Issues to Check

### Issue: "Things sometimes fail when clicking buttons"

Please test these specific scenarios and note what fails:

#### Purchase Orders Page (`/purchase-orders`)
- [ ] Click "הזמנה חדשה" (New Order) button
  - **Does it navigate to /purchase-orders/new?**
  - **Or does nothing happen?**
  - **Console error?**

#### Create PO Page (`/purchase-orders/new`)
- [ ] Can you select a supplier from dropdown?
- [ ] Can you select a company from dropdown?
- [ ] Click "הוסף פריט מקטלוג" (Add from Catalogue)
  - **Does dialog open?**
  - **Or error?**
- [ ] Click "הוסף פריט מותאם" (Add Custom Item)
  - **Does dialog open?**
- [ ] Click "שמור טיוטה" (Save Draft)
  - **Does it work?**
  - **Error message?**

#### Dashboard (`/dashboard`)
- [ ] Do stats cards show numbers?
- [ ] Click "עבור לאישורים" if you see pending approvals
  - **Does it navigate?**
- [ ] Click "צפה בכל ההזמנות"
  - **Does it navigate?**

#### Admin Pages (`/admin/users`, `/admin/items`, etc.)
- [ ] Can you access /admin/users?
- [ ] Click "New User" button
  - **Dialog opens?**
  - **Or error?**
- [ ] Try creating a user
  - **Form validation works?**
  - **Save works?**

---

## 🐛 Report Format

For each issue you find, please tell me:

1. **What page?** (URL)
2. **What did you click?** (Button name/description)
3. **What happened?** (Error message, nothing, wrong behavior)
4. **What did you expect?** (What should have happened)
5. **Console error?** (F12 → Console, copy any red errors)

### Example:
```
Page: /purchase-orders/new
Clicked: "Add from Catalogue" button
What happened: Nothing, button doesn't respond
Expected: Dialog should open
Console error: "Cannot find module X" or "undefined is not a function"
```

---

## 🔧 Quick Fixes to Try

If buttons don't work:

1. **Check Console (F12)** - Look for JavaScript errors
2. **Hard Refresh** - Ctrl+Shift+R (clears cache)
3. **Check Network Tab** - See if API calls are failing
4. **Check if data exists** - Open Prisma Studio to verify you have suppliers, companies, items

---

## 📝 Testing Order

1. **First**: Verify you can log in
2. **Second**: Check if you have test data (Prisma Studio)
3. **Third**: Test navigation (can you click between pages?)
4. **Fourth**: Test button clicks on each page
5. **Fifth**: Test creating/editing data

---

## ⚡ Quick Database Seed

If you don't have any data, tell me and I can create a seed script to populate:
- Users (SUPER_ADMIN, ADMIN, MANAGER, USER)
- Companies (3-5)
- Suppliers (5-10)
- Items (10-20)
- Characters with hierarchy

This will make testing much easier!

---

**Start here**: Open http://localhost:3002 and let me know what you see!
