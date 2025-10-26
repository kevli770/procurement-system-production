# Playwright Automated Test Plan

## Test Execution Order

Each test will be executed using Playwright MCP with specific verification steps.

---

## TEST 1: Login Page (/login)

**URL**: http://localhost:3002/login

### Test Steps:
1. Navigate to http://localhost:3002
2. Verify redirect to /login (if not logged in)
3. Take snapshot of login page
4. Verify page elements present:
   - Email input field
   - Password input field
   - Login button
   - Hebrew text (RTL layout)
5. Test invalid login:
   - Type: invalid@test.com
   - Type password: wrongpassword
   - Click login button
   - Verify error message appears
6. Test valid login (SUPER_ADMIN):
   - Type: superadmin@test.com
   - Type password: password123
   - Click login button
   - Verify redirect to /dashboard
7. Check console for errors

**Expected Results**:
- Login page displays in Hebrew RTL
- Invalid credentials show error
- Valid credentials redirect to dashboard
- No console errors

---

## TEST 2: Dashboard Page (/dashboard)

**URL**: http://localhost:3002/dashboard
**Prerequisites**: Logged in as superadmin@test.com

### Test Steps:
1. Navigate to /dashboard
2. Take snapshot of dashboard
3. Verify skeleton loaders appear during data fetch
4. Wait for data to load
5. Take snapshot after loading
6. Verify all 4 stats cards display:
   - Total Purchase Orders
   - Pending Approvals
   - This Month Spending
   - Total Spending
7. Verify recent orders section:
   - If data exists: table with POs
   - If no data: empty state with "צור הזמנה חדשה" button
8. Click "צור הזמנה חדשה" button (or navigation button)
9. Verify navigation to /purchase-orders/new
10. Go back to dashboard
11. Check console for errors

**Expected Results**:
- Skeleton loaders show during fetch
- Stats cards display correct data
- Recent orders table or empty state appears
- Navigation buttons work
- Hebrew RTL throughout
- No console errors

---

## TEST 3: Purchase Orders List (/purchase-orders)

**URL**: http://localhost:3002/purchase-orders
**Prerequisites**: Logged in as superadmin@test.com

### Test Steps:
1. Navigate to /purchase-orders
2. Take snapshot
3. Verify skeleton loaders during fetch
4. Wait for data to load
5. Take snapshot after loading
6. If POs exist:
   - Verify table displays with columns: מספר הזמנה, תאריך, ספק, חברה, סכום כולל, סטטוס, נוצר על ידי, פעולות
   - Verify status badges show correct colors
   - Verify amounts formatted with ₪
   - Click "צפה" button on first PO
   - Verify navigation to /purchase-orders/[id]
   - Go back
7. If no POs:
   - Verify empty state displays
   - Verify empty state has "צור הזמנה ראשונה" button
8. Click "הזמנה חדשה" button
9. Verify navigation to /purchase-orders/new
10. Check console for errors

**Expected Results**:
- Skeleton loaders appear
- Table or empty state displays correctly
- Status badges colored appropriately
- All navigation buttons work
- No console errors

---

## TEST 4: Create Purchase Order (/purchase-orders/new)

**URL**: http://localhost:3002/purchase-orders/new
**Prerequisites**: Logged in as superadmin@test.com

### Test Steps:
1. Navigate to /purchase-orders/new
2. Take snapshot
3. Verify form elements present:
   - Supplier dropdown
   - Company dropdown
   - "הוסף פריט מקטלוג" button
   - "הוסף פריט מותאם" button
   - Line items table (empty)
   - "ביטול", "שמור טיוטה", "שלח לאישור" buttons
4. Test adding item from catalogue:
   - Click "הוסף פריט מקטלוג"
   - Verify dialog opens
   - Take snapshot of dialog
   - Select item from dropdown (if items exist)
   - Enter quantity: 2
   - Click "הוסף"
   - Verify dialog closes
   - Verify item appears in table
   - Verify line total calculates correctly
5. Test adding custom item:
   - Click "הוסף פריט מותאם"
   - Verify dialog opens
   - Fill: Name="פריט בדיקה", Unit Price=100, Quantity=1
   - Click "הוסף"
   - Verify item appears in table
6. Verify grand total updates
7. Test form validation:
   - Try to submit without supplier
   - Verify error message
8. Fill supplier and company
9. Click "שמור טיוטה"
10. Verify success message
11. Verify navigation to PO details page
12. Check console for errors

**Expected Results**:
- All buttons respond
- Dialogs open/close correctly
- Items add to table
- Totals calculate correctly
- Validation works
- Save draft creates PO
- No console errors

---

## TEST 5: View Purchase Order Details (/purchase-orders/[id])

**URL**: http://localhost:3002/purchase-orders/[id] (using PO created in TEST 4)
**Prerequisites**: Logged in as superadmin@test.com, PO exists

### Test Steps:
1. Navigate to /purchase-orders
2. Click "צפה" on a DRAFT PO
3. Take snapshot
4. Verify PO details display:
   - PO Number
   - Date
   - Supplier name
   - Company name
   - Status badge (טיוטה)
   - Line items table
   - Grand total
5. Verify action buttons visible:
   - "עריכה" (Edit)
   - "מחק" (Delete)
   - "שלח לאישור" (Submit)
6. Click "עריכה"
7. Verify form becomes editable
8. Modify quantity on a line item
9. Verify total recalculates
10. Click "שמור"
11. Verify success message
12. Take snapshot after save
13. Check console for errors

**Expected Results**:
- All PO details display correctly
- Edit mode works
- Calculations update dynamically
- Save works
- Status badge correct
- No console errors

---

## TEST 6: Approvals Page (/approvals)

**URL**: http://localhost:3002/approvals
**Prerequisites**: Logged in as manager@test.com

### Test Steps:
1. Logout from superadmin
2. Login as manager@test.com / password123
3. Navigate to /approvals
4. Take snapshot
5. If pending approvals exist:
   - Verify table displays with pending POs
   - Verify "אשר" and "דחה" buttons visible
   - Click "אשר" on first PO
   - Verify confirmation dialog opens
   - Take snapshot of dialog
   - Enter optional remarks
   - Click confirm
   - Verify success message
   - Verify PO disappears from list
6. If no pending approvals:
   - Verify empty state displays
   - Verify empty state message correct
7. Check console for errors

**Expected Results**:
- Manager sees only their pending approvals
- Approve/Reject buttons work
- Confirmation dialogs appear
- PO status updates after approval
- No console errors

---

## TEST 7: Admin - Users Page (/admin/users)

**URL**: http://localhost:3002/admin/users
**Prerequisites**: Logged in as admin@test.com

### Test Steps:
1. Logout and login as admin@test.com / password123
2. Navigate to /admin/users
3. Take snapshot
4. Verify users table displays with all users
5. Verify columns: Name, Email, Role, Manager, Active, Actions
6. Click "New User" button
7. Verify dialog opens
8. Take snapshot of dialog
9. Fill form:
   - Name: "Test User"
   - Email: "testuser@test.com"
   - Password: "password123"
   - Role: USER
   - Select manager
10. Click "Save"
11. Verify success message
12. Verify new user appears in table
13. Click "Edit" on the new user
14. Modify name to "Test User Updated"
15. Click "Save"
16. Verify user updated in table
17. Click "Delete" on test user
18. Confirm deletion
19. Verify user removed
20. Check console for errors

**Expected Results**:
- All CRUD operations work
- Dialogs open/close correctly
- Form validation works
- Table updates after operations
- No console errors

---

## TEST 8: Admin - Items Page (/admin/items)

**URL**: http://localhost:3002/admin/items
**Prerequisites**: Logged in as admin@test.com

### Test Steps:
1. Navigate to /admin/items
2. Take snapshot
3. Verify items table displays
4. Click "New Item"
5. Verify dialog opens
6. Fill form:
   - Name: "פריט בדיקה"
   - SKU: "TEST-001"
   - Description: "תיאור בדיקה"
   - Suggested Price: 150
7. Click "Save"
8. Verify success message
9. Verify item appears in table
10. Click "Edit" on test item
11. Modify price to 200
12. Save and verify update
13. Click "Delete" (deactivate)
14. Verify item marked inactive
15. Check console for errors

**Expected Results**:
- CRUD operations work
- SKU auto-generated if not provided
- Validation enforced
- Inactive items visible but marked
- No console errors

---

## TEST 9: Admin - Suppliers Page (/admin/suppliers)

**URL**: http://localhost:3002/admin/suppliers
**Prerequisites**: Logged in as admin@test.com

### Test Steps:
1. Navigate to /admin/suppliers
2. Take snapshot
3. Verify suppliers table displays
4. Click "New Supplier"
5. Fill form:
   - Name: "ספק בדיקה"
   - Email: "test@supplier.com"
   - Phone: "03-9999999"
6. Save and verify creation
7. Edit supplier
8. Verify update works
9. Delete (deactivate) supplier
10. Verify marked inactive
11. Check console for errors

**Expected Results**:
- All CRUD operations work
- Validation works
- Table updates correctly
- No console errors

---

## TEST 10: Admin - Companies Page (/admin/companies)

**URL**: http://localhost:3002/admin/companies
**Prerequisites**: Logged in as admin@test.com

### Test Steps:
1. Navigate to /admin/companies
2. Take snapshot
3. Verify companies table displays
4. Click "New Company"
5. Fill: Name="חברת בדיקה"
6. Save and verify creation
7. Edit company name
8. Verify update
9. Delete (deactivate)
10. Verify marked inactive
11. Check console for errors

**Expected Results**:
- CRUD operations work
- Validation enforced
- No console errors

---

## TEST 11: Admin - Characters Page (/admin/characters)

**URL**: http://localhost:3002/admin/characters
**Prerequisites**: Logged in as admin@test.com

### Test Steps:
1. Navigate to /admin/characters
2. Take snapshot
3. Verify characters table displays
4. Verify hierarchy levels visible (Level 1-4 Managers)
5. Click "New Character"
6. Fill form with name and select Level 1 Manager
7. Save and verify creation
8. Edit character
9. Verify update works
10. Check console for errors

**Expected Results**:
- CRUD operations work
- Hierarchy selection works
- Validation enforced
- No console errors

---

## TEST 12: Navigation & Role-Based Access

**Prerequisites**: Multiple user logins

### Test Steps:
1. Login as user1@test.com / password123
2. Try to access /admin/users
3. Verify redirect or "Unauthorized" message
4. Verify sidebar doesn't show admin links
5. Navigate to /purchase-orders
6. Verify can create PO
7. Verify cannot access other users' draft POs
8. Logout
9. Login as manager@test.com
10. Verify can access /approvals
11. Verify sidebar shows appropriate links
12. Logout
13. Login as superadmin@test.com
14. Verify can access all pages
15. Check console for errors

**Expected Results**:
- Role-based access enforced
- Unauthorized users redirected
- Sidebar shows role-appropriate links
- No console errors

---

## TEST 13: Hebrew RTL & Responsive Design

**URL**: All pages
**Prerequisites**: Logged in

### Test Steps:
1. Navigate through all pages
2. Verify all text aligns right
3. Verify icons positioned correctly (right side)
4. Verify forms align RTL
5. Verify tables read right-to-left
6. Resize browser to 768px (tablet)
7. Verify layout adjusts
8. Resize to 375px (mobile)
9. Verify mobile-friendly
10. Take screenshots at each viewport

**Expected Results**:
- Consistent RTL throughout
- Responsive at all viewports
- Touch-friendly on mobile
- No layout breaks

---

## TEST 14: Console Errors Check

**URL**: All pages tested

### Test Steps:
1. After each page test, check console messages
2. Filter for errors only
3. Document any JavaScript errors
4. Document any network errors (failed API calls)
5. Document any warnings

**Expected Results**:
- No critical JavaScript errors
- All API calls succeed
- No 404 or 500 errors

---

## Total Tests: 14 Test Suites
**Estimated Time**: 30-45 minutes (automated)
**Pages Covered**: All 11 pages
**Test Cases**: 100+ individual test steps

## Test Accounts:
- superadmin@test.com / password123 (SUPER_ADMIN)
- admin@test.com / password123 (ADMIN)
- manager@test.com / password123 (MANAGER)
- user1@test.com / password123 (USER)

## Execution Strategy:
1. Run tests sequentially to avoid state conflicts
2. Take snapshots at key moments
3. Verify console after each page
4. Document all failures in BUGS_FOUND.md
5. Fix bugs and re-test
