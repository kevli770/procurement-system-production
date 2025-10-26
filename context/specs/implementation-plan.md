# Implementation Plan
# תכנית מימוש - Procurement System

**Version:** 1.0
**Date:** 2025-10-20
**Estimated Duration:** 8-10 weeks

---

## 1. Overview

This implementation plan breaks down the development into **manageable phases** following the **user story approach**. Each phase delivers working, testable features incrementally.

### 1.1 Development Strategy

- **MVP-First**: Build core features that deliver immediate value
- **Incremental Delivery**: Each phase is independently deployable
- **Test as You Go**: Verify each feature before moving forward
- **User Story Driven**: Organize tasks by user stories, not by technical layers

### 1.2 Phase Summary

| Phase | Duration | Description | Deliverable |
|-------|----------|-------------|-------------|
| **Phase 0** | 1 week | Project setup & foundation | Working dev environment |
| **Phase 1** | 2 weeks | Authentication & Admin (Users, Items, Suppliers) | Admin can manage data |
| **Phase 2** | 2 weeks | Purchase Order Creation | Users can create POs |
| **Phase 3** | 2 weeks | Approval Workflow | Multi-level approval works |
| **Phase 4** | 1 week | Dashboard & Reports | Analytics and insights |
| **Phase 5** | 1 week | PDF & Email | Cash Pay, PO PDFs, email automation |
| **Phase 6** | 1 week | Polish & Deployment | Production-ready system |

**Total:** 10 weeks (can be shortened to 8 weeks with tight focus)

---

## 2. Phase 0: Project Setup & Foundation

**Duration:** 1 week
**Goal:** Set up development environment and foundational infrastructure

### Tasks

#### Setup & Configuration

- [ ] T001 [P] Initialize Next.js project structure (already done, verify)
- [ ] T002 [P] Install and configure Tailwind CSS (already done, verify)
- [ ] T003 [P] Install and configure ShadCN UI (already done, verify)
- [ ] T004 Install and configure Prisma ORM
- [ ] T005 Create `.env` file with required variables
- [ ] T006 [P] Configure TypeScript with strict mode
- [ ] T007 [P] Setup ESLint and Prettier

#### Database Setup

- [ ] T008 Create Prisma schema (copy from SPEC.md → prisma/schema.prisma)
- [ ] T009 Generate Prisma Client
- [ ] T010 Create initial migration
- [ ] T011 Create database helper (lib/prisma.ts)

#### Authentication Foundation

- [ ] T012 Install NextAuth.js v5 dependencies
- [ ] T013 Configure NextAuth.js (app/api/auth/[...nextauth]/route.ts)
- [ ] T014 Create auth utilities (lib/auth.ts)
- [ ] T015 Setup session middleware (middleware.ts)

#### Utilities & Helpers

- [ ] T016 [P] Create logger utility (lib/logger.ts using Winston)
- [ ] T017 [P] Create encryption utility for SMTP passwords (lib/crypto.ts)
- [ ] T018 [P] Create API error handler (lib/api-error.ts)
- [ ] T019 [P] Create date utilities (lib/date-utils.ts using date-fns)

#### Layout & Navigation

- [ ] T020 Create root layout with providers (app/layout.tsx)
- [ ] T021 Create dashboard layout with sidebar (app/(dashboard)/layout.tsx)
- [ ] T022 Create Header component (components/layout/Header.tsx)
- [ ] T023 Create Sidebar navigation component (components/layout/Sidebar.tsx)

#### Seed Data

- [ ] T024 Create seed script (prisma/seed.ts)
- [ ] T025 Add initial admin user (CTO)
- [ ] T026 [P] Add initial characters (Service/Item/Manpower)
- [ ] T027 [P] Add initial companies (Company A, B, C)
- [ ] T028 Run seed script

#### Testing Foundation

- [ ] T029 Create test database connection
- [ ] T030 Verify login flow works with seed admin user

**Phase 0 Completion Criteria:**
- ✅ Dev server runs without errors
- ✅ Database created with all tables
- ✅ Admin user can log in
- ✅ Dashboard layout displays correctly

---

## 3. Phase 1: Authentication & Admin Management

**Duration:** 2 weeks
**Goal:** Complete user management, items catalogue, suppliers, and system admin features

### User Story 1: User Authentication

**As a user, I want to log in to the system so that I can access my purchase orders.**

#### Tasks

- [ ] T101 Create login page UI (app/(auth)/login/page.tsx)
- [ ] T102 Create login form with validation (React Hook Form + Zod)
- [ ] T103 Implement login API logic (NextAuth credentials provider)
- [ ] T104 Create auth layout (app/(auth)/layout.tsx)
- [ ] T105 Add logout functionality
- [ ] T106 Test login/logout flow

**Test Criteria:**
- User can log in with email/password
- Invalid credentials show error message
- After login, user sees dashboard
- User name appears in header
- Logout works and redirects to login

---

### User Story 2: User Management (Admin)

**As an admin, I want to manage users so that I can control who accesses the system.**

#### Tasks

- [ ] T201 Create users list page (app/(dashboard)/admin/users/page.tsx)
- [ ] T202 Create users table component (components/tables/UsersTable.tsx)
- [ ] T203 Create user form component (components/forms/UserForm.tsx)
- [ ] T204 Create API: GET /api/users (list all users)
- [ ] T205 Create API: POST /api/users (create user)
- [ ] T206 Create API: PUT /api/users/:id (update user)
- [ ] T207 Create API: DELETE /api/users/:id (soft delete user)
- [ ] T208 Create user detail page (app/(dashboard)/admin/users/[id]/page.tsx)
- [ ] T209 Implement user hierarchy selector (manager dropdown)
- [ ] T210 Add approval limit input field
- [ ] T211 Test user CRUD operations

**Test Criteria:**
- Admin can view list of all users
- Admin can create new user with all fields (name, email, password, role, approval limit, manager)
- Admin can edit existing user
- Admin can soft-delete (deactivate) user
- User hierarchy displays correctly (who reports to who)
- Only ADMIN/SUPER_ADMIN can access user management

---

### User Story 3: Items Catalogue Management

**As an admin, I want to manage the items catalogue so that users can select items in purchase orders.**

#### Tasks

- [ ] T301 Create items list page (app/(dashboard)/items/page.tsx)
- [ ] T302 Create items table component with search/filter (components/tables/ItemsTable.tsx)
- [ ] T303 Create item form component (components/forms/ItemForm.tsx)
- [ ] T304 Create API: GET /api/items (list items with pagination)
- [ ] T305 Create API: GET /api/items/:id (get item details)
- [ ] T306 Create API: POST /api/items (create item)
- [ ] T307 Create API: PUT /api/items/:id (update item)
- [ ] T308 Create API: DELETE /api/items/:id (soft delete)
- [ ] T309 Implement SKU auto-generation logic (lib/sku-generator.ts)
- [ ] T310 Create character selection dropdowns (character1/2/3)
- [ ] T311 Create API: GET /api/characters?type=character1 (get characters by type)
- [ ] T312 Add item validity period fields (from-to dates)
- [ ] T313 Create item detail page (app/(dashboard)/items/[id]/page.tsx)
- [ ] T314 Test item CRUD operations

**Test Criteria:**
- Admin can view all items in a table
- Admin can search items by name/SKU
- Admin can filter by character1/supplier
- Admin can create new item (SKU auto-generated)
- Admin can edit existing item (cannot edit SKU)
- Admin can soft-delete item
- Item form validates all fields correctly

---

### User Story 4: Suppliers Management

**As an admin, I want to manage suppliers so that I can assign them to items and purchase orders.**

#### Tasks

- [ ] T401 Create suppliers list page (app/(dashboard)/suppliers/page.tsx)
- [ ] T402 Create suppliers table component (components/tables/SuppliersTable.tsx)
- [ ] T403 Create supplier form component (components/forms/SupplierForm.tsx)
- [ ] T404 Create API: GET /api/suppliers (list suppliers)
- [ ] T405 Create API: GET /api/suppliers/:id (get supplier details)
- [ ] T406 Create API: POST /api/suppliers (create supplier)
- [ ] T407 Create API: PUT /api/suppliers/:id (update supplier)
- [ ] T408 Create API: DELETE /api/suppliers/:id (soft delete)
- [ ] T409 Create supplier detail page (app/(dashboard)/suppliers/[id]/page.tsx)
- [ ] T410 Test supplier CRUD operations

**Test Criteria:**
- Admin can view all suppliers
- Admin can create new supplier with all fields
- Admin can edit supplier
- Admin can soft-delete supplier
- Email validation works

---

### User Story 5: Dynamic Lists (Characters) Management

**As an admin, I want to manage dynamic classification lists so that items can be categorized flexibly.**

#### Tasks

- [ ] T501 Create characters management page (app/(dashboard)/admin/characters/page.tsx)
- [ ] T502 Create characters table grouped by type (components/tables/CharactersTable.tsx)
- [ ] T503 Create character form component (components/forms/CharacterForm.tsx)
- [ ] T504 Create API: GET /api/characters (list all characters)
- [ ] T505 Create API: POST /api/characters (create character)
- [ ] T506 Create API: PUT /api/characters/:id (update character)
- [ ] T507 Create API: DELETE /api/characters/:id (delete character)
- [ ] T508 Test character CRUD operations

**Test Criteria:**
- Admin can view characters grouped by type (char1, char2, char3)
- Admin can add new character to any type
- Admin can edit/delete characters
- Character1 includes: Service, Item, Manpower

---

### User Story 6: Companies Management

**As an admin, I want to manage companies in the group so that users can select which company to charge.**

#### Tasks

- [ ] T601 Create companies management page (app/(dashboard)/admin/companies/page.tsx)
- [ ] T602 Create companies table component (components/tables/CompaniesTable.tsx)
- [ ] T603 Create company form component (components/forms/CompanyForm.tsx)
- [ ] T604 Create API: GET /api/companies (list companies)
- [ ] T605 Create API: POST /api/companies (create company)
- [ ] T606 Create API: PUT /api/companies/:id (update company)
- [ ] T607 Test company CRUD operations

**Test Criteria:**
- Admin can view all companies
- Admin can create/edit companies
- Companies appear in PO form dropdown

---

**Phase 1 Completion Criteria:**
- ✅ Admin can manage users, items, suppliers, characters, companies
- ✅ All CRUD operations work correctly
- ✅ Data validation prevents invalid entries
- ✅ UI is responsive and user-friendly

---

## 4. Phase 2: Purchase Order Creation

**Duration:** 2 weeks
**Goal:** Users can create, save, and submit purchase orders

### User Story 7: Create Purchase Order

**As a user, I want to create a purchase order so that I can request items/services.**

#### Tasks

- [ ] T701 Create PO list page (app/(dashboard)/purchase-orders/page.tsx)
- [ ] T702 Create PO table component (components/tables/POTable.tsx)
- [ ] T703 Create "New PO" button and navigation
- [ ] T704 Create PO form page (app/(dashboard)/purchase-orders/new/page.tsx)
- [ ] T705 Create PO form component (components/forms/POForm.tsx)
- [ ] T706 Create PO header section (supplier, company, date, remarks)
- [ ] T707 Create line items table component (components/forms/POLineItemsTable.tsx)
- [ ] T708 Implement item search/select for line items
- [ ] T709 Implement auto-fill item details (name, price, characters)
- [ ] T710 Implement quantity and price editing
- [ ] T711 Calculate line total automatically (price × quantity)
- [ ] T712 Calculate PO total automatically (sum of line totals)
- [ ] T713 Create API: POST /api/purchase-orders (create PO)
- [ ] T714 Implement PO number generation (lib/po-number-generator.ts)
- [ ] T715 Test PO creation flow

**Test Criteria:**
- User can click "New PO" and see empty form
- User can select supplier from dropdown
- User can select company from dropdown
- User can add line items by searching/selecting items
- Item details auto-fill (name, price, characters)
- User can edit price and quantity for each line
- Line total updates automatically
- PO total updates automatically
- User can add/remove line items
- Form validates required fields

---

### User Story 8: Save PO as Draft

**As a user, I want to save my purchase order as a draft so that I can come back to finish it later.**

#### Tasks

- [ ] T801 Add "Save as Draft" button to PO form
- [ ] T802 Implement save draft logic (status = DRAFT)
- [ ] T803 Create API: PUT /api/purchase-orders/:id (update PO)
- [ ] T804 Show draft POs in PO list with "Draft" badge
- [ ] T805 Enable editing draft POs
- [ ] T806 Create PO detail/edit page (app/(dashboard)/purchase-orders/[id]/page.tsx)
- [ ] T807 Test save draft flow

**Test Criteria:**
- User can save PO as draft
- Draft PO appears in PO list
- User can click on draft PO to edit it
- Changes are saved when user saves again

---

### User Story 9: Submit PO for Approval

**As a user, I want to submit my purchase order so that it can be approved.**

#### Tasks

- [ ] T901 Add "Submit for Approval" button to PO form
- [ ] T902 Validate PO completeness before submit (all required fields)
- [ ] T903 Create API: POST /api/purchase-orders/:id/submit (submit PO)
- [ ] T904 Implement auto-approval logic (lib/approval-logic.ts)
- [ ] T905 Check if total ≤ user's approval limit
- [ ] T906 If yes: set status to APPROVED, skip approval flow
- [ ] T907 If no: set status to PENDING_APPROVAL, create Approval record
- [ ] T908 Get user's manager from hierarchy
- [ ] T909 Create Approval record (approverId = manager, level = 1)
- [ ] T910 Send notification to manager (placeholder: log to console)
- [ ] T911 Update PO status badge in PO list
- [ ] T912 Test auto-approval for small amounts
- [ ] T913 Test approval routing for large amounts

**Test Criteria:**
- User can submit PO if all fields are complete
- If total ≤ user's limit: PO auto-approved
- If total > user's limit: PO status = PENDING_APPROVAL
- Approval record created with correct approver
- User sees updated status in PO list

---

### User Story 10: View My Purchase Orders

**As a user, I want to see a list of all my purchase orders so that I can track their status.**

#### Tasks

- [ ] T1001 Create API: GET /api/purchase-orders (list POs with filters)
- [ ] T1002 Filter POs by current user (createdById)
- [ ] T1003 Add search functionality (PO number, supplier)
- [ ] T1004 Add status filter (Draft, Pending, Approved, etc.)
- [ ] T1005 Add date range filter
- [ ] T1006 Implement pagination
- [ ] T1007 Display status badges with colors
- [ ] T1008 Test PO list with various filters

**Test Criteria:**
- User sees only their own POs (not others')
- User can search by PO number or supplier name
- User can filter by status
- User can filter by date range
- Pagination works for large lists
- Clicking on PO opens detail page

---

**Phase 2 Completion Criteria:**
- ✅ User can create new PO with line items
- ✅ User can save PO as draft
- ✅ User can submit PO for approval
- ✅ Auto-approval works for amounts within limit
- ✅ Manual approval routing works for amounts over limit
- ✅ User can view list of their POs with filters

---

## 5. Phase 3: Approval Workflow

**Duration:** 2 weeks
**Goal:** Multi-level approval system with manager approval/rejection

### User Story 11: View Pending Approvals

**As a manager, I want to see all purchase orders waiting for my approval.**

#### Tasks

- [ ] T1101 Create approvals page (app/(dashboard)/approvals/page.tsx)
- [ ] T1102 Create API: GET /api/approvals (list approvals for current user)
- [ ] T1103 Filter approvals where approverId = current user AND status = PENDING
- [ ] T1104 Create approval card component (components/approvals/ApprovalCard.tsx)
- [ ] T1105 Display PO details in approval card (number, supplier, total, creator)
- [ ] T1106 Add "View Details" link to open PO
- [ ] T1107 Test approval list

**Test Criteria:**
- Manager sees list of POs waiting for approval
- Each approval card shows PO summary
- Manager can click to view full PO details

---

### User Story 12: Approve Purchase Order

**As a manager, I want to approve a purchase order so that it can proceed.**

#### Tasks

- [ ] T1201 Create approval page (app/(dashboard)/purchase-orders/[id]/approve/page.tsx)
- [ ] T1202 Display full PO details (header, line items, totals)
- [ ] T1203 Add approval history component (components/approvals/ApprovalHistory.tsx)
- [ ] T1204 Show previous approvals (if multi-level)
- [ ] T1205 Add "Approve" button
- [ ] T1206 Create API: POST /api/approvals/:id/approve
- [ ] T1207 Implement approval decision logic (lib/approval-decision.ts)
- [ ] T1208 Check if total ≤ approver's limit
- [ ] T1209 If yes: set PO status to APPROVED, trigger post-approval actions
- [ ] T1210 If no: check if approver has manager
- [ ] T1211 If manager exists: create next-level approval (level + 1)
- [ ] T1212 If no manager (top level): auto-approve (CTO level)
- [ ] T1213 Update approval record status to APPROVED
- [ ] T1214 Send notification to next approver (if needed)
- [ ] T1215 Test approval flow with multiple levels

**Test Criteria:**
- Manager can view PO details before approving
- Manager can approve PO
- If within manager's limit: PO approved
- If over manager's limit: routed to next level
- Approval history shows all approval steps
- User receives notification when PO is approved

---

### User Story 13: Reject Purchase Order

**As a manager, I want to reject a purchase order with a reason.**

#### Tasks

- [ ] T1301 Add "Reject" button to approval page
- [ ] T1302 Create rejection dialog with comments field
- [ ] T1303 Create API: POST /api/approvals/:id/reject
- [ ] T1304 Set approval status to REJECTED
- [ ] T1305 Set PO status to REJECTED
- [ ] T1306 Save rejection comments
- [ ] T1307 Send notification to PO creator with rejection reason
- [ ] T1308 Test rejection flow

**Test Criteria:**
- Manager can reject PO
- Manager must provide rejection reason
- PO status changes to REJECTED
- Creator receives notification with reason
- Rejected POs cannot be edited (locked)

---

### User Story 14: Request Changes to Purchase Order

**As a manager, I want to request changes to a purchase order so that the creator can fix issues.**

#### Tasks

- [ ] T1401 Add "Request Changes" button to approval page
- [ ] T1402 Create change request dialog with comments field
- [ ] T1403 Create API: POST /api/approvals/:id/request-change
- [ ] T1404 Set approval status to CHANGE_REQUESTED
- [ ] T1405 Set PO status to CHANGE_REQUESTED
- [ ] T1406 Save change request comments
- [ ] T1407 Send notification to PO creator with requested changes
- [ ] T1408 Allow creator to edit PO again (unlock)
- [ ] T1409 When creator re-submits: reset approval flow (start from level 1)
- [ ] T1410 Test change request flow

**Test Criteria:**
- Manager can request changes
- Manager must provide change request comments
- PO status changes to CHANGE_REQUESTED
- Creator can edit PO again
- Creator sees change request comments
- After re-submit, approval starts from level 1 again

---

### User Story 15: View Approval History

**As a user, I want to see the approval history of my purchase order.**

#### Tasks

- [ ] T1501 Add approval history section to PO detail page
- [ ] T1502 Display all approval records for PO (ordered by level)
- [ ] T1503 Show approver name, status, timestamp, comments
- [ ] T1504 Use icons/colors for status (pending/approved/rejected)
- [ ] T1505 Test approval history display

**Test Criteria:**
- PO detail page shows approval history
- Each approval step is clearly visible
- Status, approver, date, and comments are shown

---

**Phase 3 Completion Criteria:**
- ✅ Manager can view pending approvals
- ✅ Manager can approve/reject/request changes
- ✅ Multi-level approval works (up to 4 levels)
- ✅ Approval routing follows hierarchy correctly
- ✅ Notifications sent at each step (placeholder for now)
- ✅ Approval history is visible

---

## 6. Phase 4: Dashboard & Reports

**Duration:** 1 week
**Goal:** Analytics dashboard and spending reports

### User Story 16: Dashboard with Key Metrics

**As a user, I want to see a dashboard with key metrics so that I can track spending.**

#### Tasks

- [ ] T1601 Create dashboard page (app/(dashboard)/page.tsx)
- [ ] T1602 Create stats card component (components/dashboard/StatsCard.tsx)
- [ ] T1603 Create API: GET /api/reports/dashboard
- [ ] T1604 Calculate total spending (current month, quarter, year)
- [ ] T1605 Calculate PO count by status
- [ ] T1606 Get top 5 suppliers by spending
- [ ] T1607 Display stats cards on dashboard
- [ ] T1608 Create spending chart component (components/dashboard/SpendingChart.tsx)
- [ ] T1609 Add chart library (recharts or chart.js)
- [ ] T1610 Display spending over time chart (monthly)
- [ ] T1611 Display spending by company (pie chart)
- [ ] T1612 Display spending by character1 (bar chart)
- [ ] T1613 Test dashboard with real data

**Test Criteria:**
- Dashboard shows total spending (month, quarter, year)
- Dashboard shows PO counts by status
- Dashboard shows top 5 suppliers
- Charts display correctly
- All numbers are accurate

---

### User Story 17: Supplier Alert

**As a manager, I want to be alerted if a supplier exceeds spending limit.**

#### Tasks

- [ ] T1701 Create supplier alert component (components/dashboard/SupplierAlert.tsx)
- [ ] T1702 Create API: GET /api/reports/supplier-alert
- [ ] T1703 Calculate spending per supplier for current month
- [ ] T1704 Check if any supplier > 100,000 NIS (configurable)
- [ ] T1705 Display red alert banner if threshold exceeded
- [ ] T1706 Display yellow warning if > 80% of threshold
- [ ] T1707 Show list of over-limit suppliers with amounts
- [ ] T1708 Add alert to dashboard page
- [ ] T1709 Test supplier alert logic

**Test Criteria:**
- Alert shows when supplier exceeds 100,000 NIS in a month
- Warning shows when supplier > 80,000 NIS
- Alert displays supplier name and total amount
- Alert is visible on dashboard

---

### User Story 18: Spending Reports

**As a manager, I want to generate spending reports with filters.**

#### Tasks

- [ ] T1801 Create reports page (app/(dashboard)/reports/page.tsx)
- [ ] T1802 Create report filters component (date range, supplier, company, user, status)
- [ ] T1803 Create API: GET /api/reports/spending
- [ ] T1804 Query POs with filters
- [ ] T1805 Aggregate spending by selected dimensions
- [ ] T1806 Create report table component (components/reports/ReportTable.tsx)
- [ ] T1807 Display report results in table
- [ ] T1808 Add export to Excel functionality (use xlsx library)
- [ ] T1809 Add export to PDF functionality
- [ ] T1810 Test report generation with various filters

**Test Criteria:**
- User can select filters (date range, supplier, company, user, status)
- Report generates correctly with selected filters
- Report shows accurate spending data
- User can export report to Excel
- User can export report to PDF

---

**Phase 4 Completion Criteria:**
- ✅ Dashboard displays key metrics and charts
- ✅ Supplier alert works and displays correctly
- ✅ Spending reports can be generated with filters
- ✅ Reports can be exported to Excel/PDF

---

## 7. Phase 5: PDF Generation & Email Automation

**Duration:** 1 week
**Goal:** Generate Cash Pay PDFs and send emails automatically

### User Story 19: Generate Cash Pay PDF

**As a system, I want to generate a Cash Pay PDF when a PO is approved.**

#### Tasks

- [ ] T1901 Install @react-pdf/renderer
- [ ] T1902 Create Cash Pay PDF template (components/pdf/CashPayDocument.tsx)
- [ ] T1903 Design PDF layout (header, logo, PO details, line items, signature section)
- [ ] T1904 Create PDF generation utility (lib/generate-pdf.ts)
- [ ] T1905 Create API: GET /api/documents/cash-pay/:poId
- [ ] T1906 Generate PDF on-the-fly or save to file system
- [ ] T1907 Save PDF to /pdfs/cash-pay/ directory
- [ ] T1908 Create CashPay record in database
- [ ] T1909 Link CashPay to PO
- [ ] T1910 Add "Download Cash Pay" button to PO detail page
- [ ] T1911 Test PDF generation

**Test Criteria:**
- When PO is approved, Cash Pay PDF is generated
- PDF includes all PO details
- PDF includes signature section
- PDF is saved to file system
- User can download Cash Pay from PO detail page

---

### User Story 20: Generate PO PDF

**As a system, I want to generate a PO PDF to send to suppliers.**

#### Tasks

- [ ] T2001 Create PO PDF template (components/pdf/PODocument.tsx)
- [ ] T2002 Design PDF layout (similar to Cash Pay but supplier-focused)
- [ ] T2003 Create API: GET /api/documents/po/:poId
- [ ] T2004 Generate and save PO PDF to /pdfs/purchase-orders/
- [ ] T2005 Add "Download PO" button to PO detail page
- [ ] T2006 Test PO PDF generation

**Test Criteria:**
- PO PDF is generated when approved
- PDF includes company logo (if configured)
- PDF is saved to file system
- User can download PO PDF

---

### User Story 21: Email Configuration

**As an admin, I want to configure SMTP settings so that the system can send emails.**

#### Tasks

- [ ] T2101 Create SMTP settings page (app/(dashboard)/admin/settings/page.tsx)
- [ ] T2102 Create SMTP settings form (host, port, user, password, from)
- [ ] T2103 Create API: PUT /api/config/smtp
- [ ] T2104 Save SMTP config to SystemConfig table
- [ ] T2105 Encrypt SMTP password before saving (use lib/crypto.ts)
- [ ] T2106 Add "Test SMTP" button
- [ ] T2107 Create API: POST /api/config/test-smtp
- [ ] T2108 Send test email using Nodemailer
- [ ] T2109 Display success/error message
- [ ] T2110 Test SMTP configuration

**Test Criteria:**
- Admin can enter SMTP settings
- Admin can test SMTP connection
- Test email is sent successfully
- Settings are saved encrypted

---

### User Story 22: Send PO to Supplier

**As a system, I want to send approved PO to the supplier automatically.**

#### Tasks

- [ ] T2201 Install Nodemailer
- [ ] T2202 Create email service utility (lib/email.ts)
- [ ] T2203 Implement sendEmail function
- [ ] T2204 Load SMTP config from database
- [ ] T2205 Compose email with PO attached
- [ ] T2206 Send email to supplier email address
- [ ] T2207 Log email in EmailLog table (status: SENT/FAILED)
- [ ] T2208 Call sendEmail in post-approval action (lib/approval-logic.ts)
- [ ] T2209 Handle email errors gracefully (log, don't block approval)
- [ ] T2210 Test email sending

**Test Criteria:**
- When PO is approved, email is sent to supplier
- Email includes PO PDF as attachment
- Email log records success/failure
- If email fails, approval still succeeds (logged error)

---

### User Story 23: Send PO to Creator

**As a system, I want to send approved PO to the creator.**

#### Tasks

- [ ] T2301 Compose email for creator (different message)
- [ ] T2302 Send email to creator's email address
- [ ] T2303 Include PO PDF as attachment
- [ ] T2304 Log email in EmailLog
- [ ] T2305 Test email to creator

**Test Criteria:**
- Creator receives email when PO is approved
- Email includes PO PDF

---

**Phase 5 Completion Criteria:**
- ✅ Cash Pay PDF is generated on approval
- ✅ PO PDF is generated on approval
- ✅ SMTP settings can be configured
- ✅ Emails are sent to supplier and creator automatically
- ✅ Email logs track all sent emails

---

## 8. Phase 6: Polish, i18n, Backup, Deployment

**Duration:** 1 week
**Goal:** Add final features and prepare for production

### User Story 24: Internationalization (Hebrew & English)

**As a user, I want to switch between Hebrew and English.**

#### Tasks

- [ ] T2401 Install next-intl
- [ ] T2402 Configure next-intl (i18n/request.ts)
- [ ] T2403 Create translation files (i18n/messages/he.json, en.json)
- [ ] T2404 Translate all UI strings to Hebrew
- [ ] T2405 Translate all UI strings to English
- [ ] T2406 Create language switcher component (components/common/LanguageSwitcher.tsx)
- [ ] T2407 Add language switcher to header
- [ ] T2408 Save language preference per user
- [ ] T2409 Apply RTL layout for Hebrew
- [ ] T2410 Test language switching

**Test Criteria:**
- User can switch language in header
- All UI strings are translated
- Hebrew displays RTL correctly
- Language preference is saved

---

### User Story 25: Upload Company Logo

**As an admin, I want to upload a company logo to appear on POs and Cash Pay.**

#### Tasks

- [ ] T2501 Add logo upload field to settings page
- [ ] T2502 Create API: POST /api/config/logo
- [ ] T2503 Save logo to /uploads/logos/ directory
- [ ] T2504 Save logo path to SystemConfig
- [ ] T2505 Load logo in PDF templates
- [ ] T2506 Display logo in header (optional)
- [ ] T2507 Test logo upload and display

**Test Criteria:**
- Admin can upload logo (PNG, JPG, SVG)
- Logo appears on PO PDF
- Logo appears on Cash Pay PDF

---

### User Story 26: Backup & Restore

**As an admin, I want to backup and restore the database.**

#### Tasks

- [ ] T2601 Create backup page (app/(dashboard)/admin/backup/page.tsx)
- [ ] T2602 Create API: POST /api/backup/create
- [ ] T2603 Implement backup logic (lib/backup.ts)
- [ ] T2604 Export all data to JSON file
- [ ] T2605 Save backup to /backups/ directory
- [ ] T2606 Create API: GET /api/backup/list (list available backups)
- [ ] T2607 Create API: POST /api/backup/restore
- [ ] T2608 Implement restore logic (lib/backup.ts)
- [ ] T2609 Add confirmation dialog before restore
- [ ] T2610 Test backup creation
- [ ] T2611 Test restore from backup

**Test Criteria:**
- Admin can create backup
- Backup file is saved with timestamp
- Admin can see list of backups
- Admin can restore from backup
- Restore confirmation dialog works

---

### User Story 27: Audit Log

**As an admin, I want to view audit logs of all actions.**

#### Tasks

- [ ] T2701 Create audit log page (app/(dashboard)/admin/audit/page.tsx)
- [ ] T2702 Create API: GET /api/audit (list audit logs with filters)
- [ ] T2703 Display audit logs in table (user, action, entity, timestamp)
- [ ] T2704 Add filters (user, action type, date range)
- [ ] T2705 Test audit log display

**Test Criteria:**
- Admin can view all audit logs
- Logs show user, action, entity, timestamp
- Filters work correctly

---

### User Story 28: Error Handling & Validation

**As a developer, I want proper error handling throughout the app.**

#### Tasks

- [ ] T2801 Add error boundaries to main layouts
- [ ] T2802 Add toast notifications for user actions (success/error)
- [ ] T2803 Add loading spinners for async operations
- [ ] T2804 Validate all forms with Zod schemas
- [ ] T2805 Add API error responses with proper status codes
- [ ] T2806 Test error scenarios

**Test Criteria:**
- Errors are caught and displayed nicely
- Forms show validation errors
- API errors are logged

---

### User Story 29: Deployment Preparation

**As a developer, I want to prepare the app for production deployment.**

#### Tasks

- [ ] T2901 Create production build script
- [ ] T2902 Test production build locally
- [ ] T2903 Create installation guide (docs/INSTALL.md)
- [ ] T2904 Create user manual (docs/USER_MANUAL.md)
- [ ] T2905 Create admin guide (docs/ADMIN_GUIDE.md)
- [ ] T2906 Setup environment variables template (.env.example)
- [ ] T2907 Test deployment on target server
- [ ] T2908 Create Windows service setup (optional, using NSSM)
- [ ] T2909 Verify all features work in production

**Test Criteria:**
- Production build succeeds without errors
- App runs on target server
- All features work in production environment
- Documentation is complete

---

**Phase 6 Completion Criteria:**
- ✅ Hebrew and English localization complete
- ✅ Company logo can be uploaded and displayed
- ✅ Backup and restore works
- ✅ Audit logs are viewable
- ✅ Error handling is robust
- ✅ App is deployed and production-ready

---

## 9. Testing Strategy

### 9.1 Testing Checklist (Manual)

After each phase, verify:

**Functionality:**
- [ ] All features work as expected
- [ ] No JavaScript errors in console
- [ ] All API endpoints return correct data
- [ ] Database is updated correctly

**UI/UX:**
- [ ] All pages are responsive (desktop, tablet, mobile)
- [ ] Forms validate correctly
- [ ] Error messages are clear
- [ ] Loading states are shown
- [ ] Success messages are displayed

**Security:**
- [ ] Only authorized users can access protected pages
- [ ] ADMIN-only pages are protected
- [ ] Passwords are never shown in plain text
- [ ] SQL injection is not possible (Prisma handles this)
- [ ] XSS attacks are prevented (React handles this)

**Performance:**
- [ ] Pages load quickly (<2 seconds)
- [ ] Large lists are paginated
- [ ] Database queries are optimized

### 9.2 End-to-End Test Scenarios

**Scenario 1: Full PO Flow (Auto-Approve)**
1. User logs in
2. Creates new PO (total < approval limit)
3. Adds line items
4. Submits PO
5. PO is auto-approved
6. Cash Pay PDF is generated
7. Email is sent to supplier and user

**Scenario 2: Full PO Flow (Multi-Level Approval)**
1. User logs in
2. Creates new PO (total > approval limit)
3. Submits PO
4. Manager 1 receives notification
5. Manager 1 approves
6. Manager 2 receives notification (if needed)
7. Manager 2 approves
8. PO is fully approved
9. PDFs and emails are sent

**Scenario 3: PO Rejection**
1. User creates and submits PO
2. Manager rejects with comments
3. User sees rejection reason
4. PO status is REJECTED (locked)

**Scenario 4: PO Change Request**
1. User creates and submits PO
2. Manager requests changes
3. User edits PO
4. User re-submits
5. Approval flow starts again from level 1

**Scenario 5: Admin Creates Item**
1. Admin logs in
2. Goes to Items page
3. Creates new item
4. SKU is auto-generated
5. Item appears in catalogue
6. Item is available for PO line items

---

## 10. Deployment Checklist

### Pre-Deployment

- [ ] All features tested and working
- [ ] Database schema finalized
- [ ] Environment variables configured
- [ ] SMTP settings tested
- [ ] Production build succeeds
- [ ] Documentation complete

### Deployment Steps

1. **Install Node.js 18+** on server
2. **Copy project files** to server
3. **Install dependencies**: `npm install`
4. **Configure .env** file
5. **Generate Prisma client**: `npx prisma generate`
6. **Run migrations**: `npx prisma migrate deploy`
7. **Seed initial data**: `npm run seed`
8. **Build for production**: `npm run build`
9. **Start server**: `npm run start`
10. **Access app**: http://[server-ip]:3000
11. **Login with admin**: admin@company.com / Admin123!
12. **Change admin password** immediately

### Post-Deployment

- [ ] Verify login works
- [ ] Create first real user
- [ ] Create first supplier
- [ ] Create first item
- [ ] Create first PO
- [ ] Test approval flow
- [ ] Test PDF generation
- [ ] Test email sending
- [ ] Create first backup
- [ ] Document any issues

---

## 11. Risk Mitigation

### Risk 1: Email Sending Fails

**Mitigation:**
- Allow manual PDF download as fallback
- Log all email failures
- Add retry mechanism (future)

### Risk 2: Database Corruption

**Mitigation:**
- Daily automatic backups (add cron job)
- Manual backup before major changes
- Test restore regularly

### Risk 3: Performance Issues with Large Data

**Mitigation:**
- Pagination on all lists
- Database indexes on key fields
- Optimize queries with Prisma

### Risk 4: User Training

**Mitigation:**
- Comprehensive user manual
- Video tutorials (future)
- Dedicated admin support

---

## 12. Post-MVP Enhancements (Future Phases)

### Phase 7: Advanced Features (Future)

- [ ] Budget tracking per company
- [ ] Contract management
- [ ] Recurring purchase orders
- [ ] Purchase requisitions (pre-PO approval)
- [ ] Inventory tracking
- [ ] Supplier portal
- [ ] E-signature integration
- [ ] Mobile app
- [ ] Advanced analytics with ML
- [ ] ERP integration (SAP, Priority)

---

## Summary

This implementation plan provides a **clear, actionable roadmap** to build the Procurement System in **10 weeks** (or 8 weeks with focus). Key highlights:

- **Phased Approach**: Each phase delivers working features
- **User Story Driven**: Tasks organized by user stories, not tech layers
- **Testable**: Each phase has clear completion criteria
- **Flexible**: Can adjust priorities based on feedback

**Recommended Workflow:**
1. Follow phases sequentially
2. Complete all tasks in a phase before moving to next
3. Test thoroughly after each phase
4. Deploy MVP (Phases 0-5) first, then add Phase 6 polish
5. Gather user feedback and iterate

**Next Step:** Begin Phase 0 (Project Setup) by creating the database schema and initializing the authentication system.

---

**Document Status:** Ready for Implementation
**Estimated Delivery:** 10 weeks from start
