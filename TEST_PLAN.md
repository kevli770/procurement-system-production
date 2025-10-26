# Procurement System - Comprehensive Test Plan

## Test Environment Setup
- **URL**: http://localhost:3000
- **Browser**: Chromium (Playwright)
- **Test Users**:
  - SUPER_ADMIN user (full access)
  - ADMIN user (admin access, no super-admin functions)
  - MANAGER user (can approve POs)
  - USER user (can create POs only)

## Pre-Test Checklist
- [ ] Database seeded with test data
- [ ] All users created with known passwords
- [ ] Test suppliers, companies, items, characters created
- [ ] Dev server running on localhost:3000

---

## 1. AUTHENTICATION & NAVIGATION TESTS

### 1.1 Login Functionality
- [ ] Navigate to /login
- [ ] Login with invalid credentials → Should show error
- [ ] Login with valid SUPER_ADMIN credentials → Should redirect to /dashboard
- [ ] Logout → Should redirect to /login
- [ ] Login with USER credentials → Should redirect to /dashboard
- [ ] Login with MANAGER credentials → Should redirect to /dashboard
- [ ] Login with ADMIN credentials → Should redirect to /dashboard

### 1.2 Navigation & Route Protection
- [ ] Access /dashboard without login → Should redirect to /login
- [ ] Access /admin/users as USER → Should show "Unauthorized" or redirect
- [ ] Access /admin/users as ADMIN → Should show users page
- [ ] Access /approvals as USER → Should redirect/show error
- [ ] Access /approvals as MANAGER → Should show approvals page
- [ ] Click on navigation links → All links work correctly
- [ ] Breadcrumbs work correctly on nested pages
- [ ] Back button navigates correctly

### 1.3 Hebrew RTL Support
- [ ] All pages display in RTL layout
- [ ] Text aligns to the right
- [ ] Icons positioned correctly (right side in RTL)
- [ ] Forms align correctly
- [ ] Tables read right-to-left

---

## 2. DASHBOARD TESTS

### 2.1 Dashboard Display
- [ ] Navigate to /dashboard
- [ ] All 4 stats cards load correctly
- [ ] Stats show accurate numbers
- [ ] Recent orders table displays (if data exists)
- [ ] Top suppliers widget displays (if data exists)
- [ ] Empty states show when no data

### 2.2 Dashboard Interactions
- [ ] Click "עבור לאישורים" (Go to Approvals) → Navigates to /approvals
- [ ] Click "צפה בכל ההזמנות" (View All Orders) → Navigates to /purchase-orders
- [ ] Click eye icon on PO → Navigates to /purchase-orders/[id]
- [ ] Click "צור הזמנה חדשה" in empty state → Navigates to /purchase-orders/new

### 2.3 Dashboard Loading States
- [ ] Skeleton loaders appear during data fetch
- [ ] Empty states display correct messages
- [ ] Empty states have working CTA buttons

---

## 3. PURCHASE ORDERS LIST TESTS

### 3.1 PO List Display
- [ ] Navigate to /purchase-orders
- [ ] All POs display in table
- [ ] Status badges show correct colors
- [ ] Amounts formatted correctly with ₪ symbol
- [ ] Dates formatted correctly (Hebrew locale)

### 3.2 PO List Actions
- [ ] Click "הזמנה חדשה" (New Order) → Navigates to /purchase-orders/new
- [ ] Click "צפה" (View) button → Navigates to specific PO
- [ ] Empty state shows when no POs exist
- [ ] Empty state CTA button works

### 3.3 PO List Loading
- [ ] Skeleton loaders display during fetch
- [ ] Table populates after loading

---

## 4. CREATE PURCHASE ORDER TESTS

### 4.1 PO Form Display
- [ ] Navigate to /purchase-orders/new
- [ ] Supplier dropdown loads with suppliers
- [ ] Company dropdown loads with companies
- [ ] "Add from Catalogue" button present
- [ ] "Add Custom Item" button present
- [ ] Action buttons present (Cancel, Save Draft, Submit)

### 4.2 Add Items from Catalogue
- [ ] Click "Add from Catalogue"
- [ ] Dialog opens
- [ ] Item dropdown loads catalogue items
- [ ] Select item
- [ ] Enter quantity
- [ ] Click Add → Item appears in line items table
- [ ] Line total calculates correctly
- [ ] Grand total updates correctly

### 4.3 Add Custom Item
- [ ] Click "Add Custom Item"
- [ ] Dialog opens
- [ ] Fill in: Name, SKU (optional), Description, Unit Price, Quantity
- [ ] Validation works (required fields)
- [ ] Click Add → Item appears in line items table
- [ ] Totals calculate correctly

### 4.4 Line Items Management
- [ ] Edit quantity inline → Line total recalculates
- [ ] Grand total updates when quantity changes
- [ ] Remove item button works
- [ ] Grand total recalculates after removal
- [ ] Cannot submit with 0 items (validation)

### 4.5 Save & Submit Actions
- [ ] Click Cancel → Navigates back with confirmation
- [ ] Click "Save Draft" → Creates PO with DRAFT status
- [ ] Redirects to PO details page
- [ ] Click "Submit for Approval" → Creates PO with PENDING_APPROVAL status
- [ ] Redirects to PO details page

### 4.6 Validation
- [ ] Supplier required → Cannot submit without supplier
- [ ] Company required → Cannot submit without company
- [ ] At least 1 line item required → Shows error
- [ ] Unit price must be > 0 for custom items

---

## 5. VIEW/EDIT PURCHASE ORDER TESTS

### 5.1 PO Details Display (DRAFT)
- [ ] Navigate to /purchase-orders/[id] with DRAFT PO
- [ ] All PO details display correctly
- [ ] Line items table shows all items
- [ ] Grand total correct
- [ ] Status badge shows "טיוטה" (DRAFT)
- [ ] Edit button visible (if creator)
- [ ] Delete button visible (if creator)
- [ ] Submit button visible (if creator)

### 5.2 PO Details Display (PENDING_APPROVAL)
- [ ] Navigate to PO with PENDING_APPROVAL status
- [ ] Status badge shows "ממתין לאישור"
- [ ] Edit/Delete buttons hidden
- [ ] Approve/Reject buttons visible (if current approver)
- [ ] Approval history/timeline visible

### 5.3 PO Details Display (APPROVED)
- [ ] Navigate to APPROVED PO
- [ ] Status badge shows "מאושר"
- [ ] Download PDF button visible
- [ ] Approval timeline shows all approvals
- [ ] No edit/approve buttons

### 5.4 PO Actions
- [ ] Click Back → Navigates to /purchase-orders
- [ ] Click Edit (DRAFT only) → Enables editing
- [ ] Click Save → Updates PO
- [ ] Click Delete (DRAFT only) → Shows confirmation → Deletes PO
- [ ] Click Submit for Approval → Confirms → Updates status → Routes to first approver
- [ ] Click Download PDF → Downloads PDF file

---

## 6. APPROVALS TESTS

### 6.1 Approvals Page Display (MANAGER)
- [ ] Login as MANAGER user
- [ ] Navigate to /approvals
- [ ] Pending approvals table loads
- [ ] Shows POs assigned to this manager
- [ ] Approve and Reject buttons visible

### 6.2 Approval Actions
- [ ] Click Approve button → Opens confirmation dialog
- [ ] Enter optional remarks
- [ ] Confirm → Approves PO
- [ ] Success toast appears
- [ ] PO disappears from pending list
- [ ] PO status updates correctly

### 6.3 Rejection Actions
- [ ] Click Reject button → Opens rejection dialog
- [ ] Remarks field required
- [ ] Submit without remarks → Shows validation error
- [ ] Enter remarks → Confirm → Rejects PO
- [ ] Success toast appears
- [ ] PO status updates to REJECTED

### 6.4 Multi-Level Approval Flow
- [ ] Create PO that requires 2+ approvals
- [ ] First manager approves → Routes to second manager
- [ ] Second manager sees PO in their approvals
- [ ] Second manager approves → PO becomes APPROVED
- [ ] Approval history shows both approvals

### 6.5 Empty State
- [ ] Manager with no pending approvals → Empty state displays
- [ ] Empty state message correct

---

## 7. ADMIN - USERS TESTS (ADMIN/SUPER_ADMIN only)

### 7.1 Users List Display
- [ ] Navigate to /admin/users
- [ ] All users display in table
- [ ] Role badges show correct colors
- [ ] Active/Inactive status visible

### 7.2 Create User
- [ ] Click "New User" button → Dialog opens
- [ ] Fill required fields: Name, Email, Password, Role
- [ ] Select Manager (if USER/MANAGER role)
- [ ] Select Character (optional)
- [ ] Click Save → User created
- [ ] Success toast appears
- [ ] User appears in table

### 7.3 Edit User
- [ ] Click Edit button → Dialog opens with pre-filled data
- [ ] Modify fields
- [ ] Click Save → User updated
- [ ] Success toast appears
- [ ] Table refreshes with new data

### 7.4 Delete User
- [ ] Click Delete → Confirmation dialog opens
- [ ] Cancel → Dialog closes, no deletion
- [ ] Confirm → User deleted
- [ ] Success toast appears
- [ ] User removed from table

### 7.5 Toggle Active Status
- [ ] Click toggle switch → Status changes
- [ ] User becomes inactive/active
- [ ] Inactive users cannot log in

### 7.6 Validation
- [ ] Email uniqueness enforced
- [ ] Password requirements enforced (min 8 chars)
- [ ] Manager required for USER/MANAGER roles
- [ ] Form validation errors display correctly

---

## 8. ADMIN - ITEMS TESTS

### 8.1 Items List Display
- [ ] Navigate to /admin/items
- [ ] All items display
- [ ] SKU, Name, Description, Unit Price, Active status visible

### 8.2 Create Item
- [ ] Click "New Item"
- [ ] Fill: Name, SKU (optional), Description, Unit Price
- [ ] Click Save → Item created
- [ ] Auto-generates SKU if not provided

### 8.3 Edit Item
- [ ] Click Edit → Dialog opens
- [ ] Modify fields → Save → Updates correctly

### 8.4 Delete/Deactivate Item
- [ ] Click Delete → Confirmation → Item marked inactive
- [ ] Item still visible in table as inactive
- [ ] Item preserved in historical POs

### 8.5 Validation
- [ ] Name required
- [ ] Unit Price required and must be > 0
- [ ] SKU unique if provided

---

## 9. ADMIN - SUPPLIERS TESTS

### 9.1 Suppliers CRUD
- [ ] Navigate to /admin/suppliers
- [ ] List displays all suppliers
- [ ] Create new supplier with Name, Email, Phone, Address
- [ ] Edit supplier → Updates correctly
- [ ] Delete supplier → Marks inactive
- [ ] Validation: Name required, unique

---

## 10. ADMIN - COMPANIES TESTS

### 10.1 Companies CRUD
- [ ] Navigate to /admin/companies
- [ ] List displays all companies
- [ ] Create company with Name
- [ ] Edit company → Updates
- [ ] Delete company → Marks inactive
- [ ] Validation: Name required, unique

---

## 11. ADMIN - CHARACTERS TESTS

### 11.1 Characters List & Hierarchy
- [ ] Navigate to /admin/characters
- [ ] List displays all characters
- [ ] Shows all 4 manager levels

### 11.2 Create Character with Hierarchy
- [ ] Click "New Character"
- [ ] Fill Name
- [ ] Select Level 1 Manager (required)
- [ ] Select Level 2 Manager (optional)
- [ ] Select Level 3 Manager (optional)
- [ ] Select Level 4 Manager (optional)
- [ ] Save → Character created with hierarchy

### 11.3 Validation
- [ ] Name required, unique
- [ ] Level 1 Manager required
- [ ] Cannot create circular references (user can't be their own manager)

---

## 12. DATA INTEGRITY TESTS

### 12.1 Snapshot Pattern
- [ ] Create PO with catalogue item
- [ ] Edit catalogue item (change price)
- [ ] View PO → Shows original price (snapshot preserved)

### 12.2 Deletion Protection
- [ ] Try to delete supplier with active POs → Should prevent or mark inactive
- [ ] Try to delete company with active POs → Should prevent or mark inactive
- [ ] Try to delete item used in POs → Should mark inactive, preserve in POs

### 12.3 Status Workflow
- [ ] DRAFT PO can be edited
- [ ] DRAFT PO can be deleted
- [ ] PENDING_APPROVAL PO cannot be edited
- [ ] PENDING_APPROVAL PO cannot be deleted
- [ ] APPROVED PO cannot be edited
- [ ] REJECTED PO cannot be edited

---

## 13. PDF GENERATION TESTS

### 13.1 PDF Download
- [ ] Navigate to APPROVED or PENDING_APPROVAL PO
- [ ] Click "Download PDF" button
- [ ] PDF file downloads
- [ ] Open PDF → All details correct
- [ ] Line items display correctly
- [ ] Totals correct
- [ ] Supplier info included
- [ ] Professional layout

---

## 14. ERROR HANDLING TESTS

### 14.1 Network Errors
- [ ] Simulate API failure → Error toast appears
- [ ] Graceful error handling, no crashes

### 14.2 Permission Errors
- [ ] USER tries to access admin page → Proper error/redirect
- [ ] USER tries to approve PO → Error message
- [ ] Non-creator tries to edit DRAFT → Error

### 14.3 Validation Errors
- [ ] All forms show validation errors clearly
- [ ] Required fields marked
- [ ] Error messages in Hebrew

---

## 15. RESPONSIVE & UI TESTS

### 15.1 Desktop Viewport (1440px)
- [ ] All pages render correctly
- [ ] Cards layout properly
- [ ] Tables fit on screen
- [ ] Navigation sidebar visible

### 15.2 Tablet Viewport (768px)
- [ ] Layout adjusts correctly
- [ ] Navigation collapses if needed
- [ ] Tables responsive or scrollable

### 15.3 Mobile Viewport (375px)
- [ ] Mobile-friendly layout
- [ ] Touch-friendly buttons
- [ ] Forms usable on mobile
- [ ] Tables scroll horizontally

### 15.4 Loading States
- [ ] All pages show skeleton loaders
- [ ] Skeletons match final layout
- [ ] Smooth transitions from loading to loaded

### 15.5 Empty States
- [ ] All empty states display correctly
- [ ] Icons visible
- [ ] Messages clear
- [ ] CTA buttons work

---

## 16. PERFORMANCE TESTS

### 16.1 Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] PO list loads in < 2 seconds
- [ ] PO creation form loads quickly

### 16.2 Large Data Sets
- [ ] 100+ POs in list → Pagination works
- [ ] 100+ users in admin → Table performs well
- [ ] Large PO (50+ line items) → Handles correctly

---

## TEST EXECUTION ORDER

**Phase 1: Foundation (Critical)**
1. Authentication & Navigation (Section 1)
2. Dashboard Basic Display (Section 2.1)
3. PO List Basic Display (Section 3.1)

**Phase 2: Core Workflows (High Priority)**
4. Create Purchase Order Full Flow (Section 4)
5. View/Edit PO (Section 5)
6. Approvals Flow (Section 6)

**Phase 3: Admin Functions (Medium Priority)**
7. Users Management (Section 7)
8. Items Management (Section 8)
9. Suppliers & Companies (Sections 9-10)
10. Characters & Hierarchy (Section 11)

**Phase 4: Data & Advanced (Lower Priority)**
11. Data Integrity (Section 12)
12. PDF Generation (Section 13)
13. Error Handling (Section 14)

**Phase 5: Polish (Final)**
14. Responsive & UI (Section 15)
15. Performance (Section 16)

---

## SUCCESS CRITERIA

- [ ] All authentication tests pass
- [ ] All navigation tests pass
- [ ] Complete PO creation → approval → PDF flow works
- [ ] All CRUD operations work correctly
- [ ] All role-based permissions enforced
- [ ] All empty states and loading states work
- [ ] Hebrew RTL displays correctly throughout
- [ ] No critical bugs or crashes
- [ ] Build passes with no errors

---

**Total Test Cases**: ~200+
**Estimated Test Time**: 4-6 hours (manual) or 1-2 hours (automated with Playwright)
