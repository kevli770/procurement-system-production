# Technical Specification
# מערכת רכש - Procurement System

**Version:** 1.0
**Date:** 2025-10-20
**Project:** Procurement System for IT Department

---

## 1. System Architecture

### 1.1 Technology Stack

**Frontend:**
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + React Query (TanStack Query)
- **PDF Generation**: @react-pdf/renderer
- **Internationalization**: next-intl
- **Date Handling**: date-fns

**Backend:**
- **API**: Next.js API Routes (App Router)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Database**: SQLite with Prisma ORM
- **Email**: Nodemailer (SMTP)
- **File Storage**: Local filesystem
- **Logging**: Winston

**Development Tools:**
- **TypeScript**: Strict mode
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library (optional)
- **Git**: Version control

---

### 1.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  PO Form     │  │  Admin Panel │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/HTTPS
┌────────────────────────────┴────────────────────────────────┐
│                      Next.js Server                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              App Router + API Routes                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Auth Service │  │ PO Service   │  │Email Service │    │
│  │ (NextAuth)   │  │              │  │(Nodemailer)  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│  ┌──────┴──────────────────┴──────────────────┴──────┐    │
│  │              Prisma ORM (Data Layer)              │    │
│  └──────────────────────────┬────────────────────────┘    │
└─────────────────────────────┼─────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                   SQLite Database                          │
│  (procurement.db - Local file)                            │
└───────────────────────────────────────────────────────────┘
```

---

### 1.3 Deployment Architecture

**Local Server Setup:**
```
┌─────────────────────────────────────────┐
│     Company Local Server / PC           │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  Node.js Runtime                │    │
│  │  - Next.js App (Port 3000)      │    │
│  │  - SQLite DB File               │    │
│  │  - Uploads/PDFs folder          │    │
│  │  - Logs folder                  │    │
│  └────────────────────────────────┘    │
│                                          │
│  Accessed by: http://localhost:3000     │
│  Or: http://[server-ip]:3000            │
└─────────────────────────────────────────┘
```

**No external dependencies** (fully offline after initial npm install)

---

## 2. Database Schema

### 2.1 Prisma Schema (Complete)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./procurement.db"
}

// ============================================
// AUTHENTICATION & USERS
// ============================================

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String
  passwordHash      String
  role              UserRole @default(USER)
  approvalLimit     Decimal  @default(0) // Maximum amount user can approve (in NIS)
  isActive          Boolean  @default(true)

  // Hierarchy
  managerId         String?
  manager           User?    @relation("UserHierarchy", fields: [managerId], references: [id])
  subordinates      User[]   @relation("UserHierarchy")

  // Preferences
  language          String   @default("he") // "he" or "en"

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastLoginAt       DateTime?

  // Relations
  createdPOs        PurchaseOrder[] @relation("POCreator")
  approvals         Approval[]
  sessions          Session[]
  accounts          Account[]

  @@index([email])
  @@index([managerId])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

enum UserRole {
  USER          // Regular user
  MANAGER       // Manager (can approve)
  ADMIN         // System admin
  SUPER_ADMIN   // CTO / Top level (no approval limit)
}

// ============================================
// ITEMS & CATALOGUE
// ============================================

model Item {
  id                String      @id @default(cuid())
  sku               String      @unique // Auto-generated
  name              String
  nameEn            String?     // English name
  description       String?
  descriptionEn     String?

  // Characters (dynamic classifications)
  character1Id      String?     // Service / Item / Manpower
  character1        Character?  @relation("ItemChar1", fields: [character1Id], references: [id])
  character2Id      String?
  character2        Character?  @relation("ItemChar2", fields: [character2Id], references: [id])
  character3Id      String?
  character3        Character?  @relation("ItemChar3", fields: [character3Id], references: [id])

  // Pricing
  suggestedPrice    Decimal     @default(0)

  // Validity Period
  isOneTimePurchase Boolean     @default(true)
  validFrom         DateTime?
  validTo           DateTime?

  // Supplier
  supplierId        String?
  supplier          Supplier?   @relation(fields: [supplierId], references: [id])

  remarks           String?
  isActive          Boolean     @default(true)

  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  poLines           POLineItem[]

  @@index([sku])
  @@index([supplierId])
  @@index([character1Id])
}

model Character {
  id          String   @id @default(cuid())
  type        String   // "character1", "character2", "character3"
  value       String   // The actual value (e.g., "Service", "Hardware")
  valueEn     String?  // English translation
  order       Int      @default(0) // Display order
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations (depending on type)
  itemsChar1  Item[]   @relation("ItemChar1")
  itemsChar2  Item[]   @relation("ItemChar2")
  itemsChar3  Item[]   @relation("ItemChar3")

  @@unique([type, value])
  @@index([type])
}

// ============================================
// SUPPLIERS
// ============================================

model Supplier {
  id              String   @id @default(cuid())
  name            String
  nameEn          String?

  // Contact Info
  email           String
  phone           String?
  contactPerson   String?

  // Business Info
  taxId           String?  // ח.פ / ע.מ
  address         String?

  remarks         String?
  isActive        Boolean  @default(true)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  items           Item[]
  purchaseOrders  PurchaseOrder[]

  @@index([email])
}

// ============================================
// COMPANIES (Group entities)
// ============================================

model Company {
  id              String   @id @default(cuid())
  name            String
  nameEn          String?
  taxId           String?  // ח.פ
  isActive        Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  purchaseOrders  PurchaseOrder[]
}

// ============================================
// PURCHASE ORDERS
// ============================================

model PurchaseOrder {
  id              String        @id @default(cuid())
  poNumber        String        @unique // Auto-generated (format: PO-YYYYMMDD-XXXX)

  // Header Info
  date            DateTime      @default(now())
  supplierId      String
  supplier        Supplier      @relation(fields: [supplierId], references: [id])
  companyId       String
  company         Company       @relation(fields: [companyId], references: [id])
  remarks         String?

  // Created by
  createdById     String
  createdBy       User          @relation("POCreator", fields: [createdById], references: [id])

  // Status
  status          POStatus      @default(DRAFT)

  // Totals
  totalAmount     Decimal       @default(0)

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  submittedAt     DateTime?     // When changed from DRAFT to FINAL
  approvedAt      DateTime?     // When fully approved

  // Relations
  lineItems       POLineItem[]
  approvals       Approval[]
  cashPayDoc      CashPay?
  emailLogs       EmailLog[]

  @@index([poNumber])
  @@index([createdById])
  @@index([supplierId])
  @@index([status])
  @@index([date])
}

enum POStatus {
  DRAFT              // User is still editing
  PENDING_APPROVAL   // Waiting for manager approval
  APPROVED           // Fully approved
  REJECTED           // Rejected by approver
  CANCELLED          // Cancelled by creator
  CHANGE_REQUESTED   // Approver requested changes
}

model POLineItem {
  id              String        @id @default(cuid())
  poId            String
  po              PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)

  // Item reference (snapshot at creation time)
  itemId          String?
  item            Item?         @relation(fields: [itemId], references: [id])

  // Snapshot data (in case item is deleted/changed later)
  itemName        String
  itemDescription String?
  itemSku         String?

  // Characters snapshot
  character1      String?
  character2      String?
  character3      String?

  // Pricing
  unitPrice       Decimal
  quantity        Decimal       @default(1)
  lineTotal       Decimal       // unitPrice * quantity

  // Order
  lineNumber      Int           // 1, 2, 3...

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([poId])
  @@index([itemId])
}

// ============================================
// APPROVAL WORKFLOW
// ============================================

model Approval {
  id              String        @id @default(cuid())
  poId            String
  po              PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)

  // Approver
  approverId      String
  approver        User          @relation(fields: [approverId], references: [id])

  // Approval details
  level           Int           // 1, 2, 3, 4 (hierarchy level)
  status          ApprovalStatus @default(PENDING)
  comments        String?       // For rejection or change requests

  // Timestamps
  createdAt       DateTime      @default(now())
  respondedAt     DateTime?     // When approver made decision

  @@index([poId])
  @@index([approverId])
  @@index([status])
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  CHANGE_REQUESTED
}

// ============================================
// CASH PAY DOCUMENTS
// ============================================

model CashPay {
  id              String        @id @default(cuid())
  poId            String        @unique
  po              PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)

  // PDF storage
  pdfPath         String        // Local file path
  pdfFilename     String

  // Signature info (from approver)
  approverName    String
  approverTitle   String?

  createdAt       DateTime      @default(now())

  @@index([poId])
}

// ============================================
// EMAIL LOGS
// ============================================

model EmailLog {
  id              String        @id @default(cuid())
  poId            String?
  po              PurchaseOrder? @relation(fields: [poId], references: [id])

  // Email details
  to              String
  subject         String
  body            String?
  attachments     String?       // JSON array of filenames

  // Status
  status          EmailStatus   @default(PENDING)
  errorMessage    String?

  // Timestamps
  createdAt       DateTime      @default(now())
  sentAt          DateTime?

  @@index([poId])
  @@index([status])
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
}

// ============================================
// SYSTEM CONFIGURATION
// ============================================

model SystemConfig {
  id              String   @id @default(cuid())
  key             String   @unique
  value           String   // JSON string for complex values
  description     String?

  updatedAt       DateTime @updatedAt
}

// Possible keys:
// - smtp_host
// - smtp_port
// - smtp_user
// - smtp_password (encrypted)
// - smtp_from
// - company_logo (base64 or file path)
// - sku_format
// - po_number_format
// - default_language
// - alert_supplier_limit (100000)

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id              String   @id @default(cuid())
  userId          String?
  action          String   // "CREATE_PO", "APPROVE_PO", "UPDATE_ITEM", etc.
  entityType      String   // "PurchaseOrder", "Item", "User", etc.
  entityId        String?
  changes         String?  // JSON of before/after
  ipAddress       String?
  userAgent       String?

  createdAt       DateTime @default(now())

  @@index([userId])
  @@index([entityType])
  @@index([createdAt])
}
```

---

### 2.2 Database Relationships Summary

```
User
├─→ PurchaseOrder (created by)
├─→ Approval (approver)
└─→ User (manager/subordinates - self-relation)

PurchaseOrder
├─→ Supplier
├─→ Company
├─→ POLineItem (1-to-many)
├─→ Approval (1-to-many, approval chain)
├─→ CashPay (1-to-1)
└─→ EmailLog (1-to-many)

POLineItem
└─→ Item (optional reference, uses snapshot)

Item
├─→ Supplier
└─→ Character (3x relations for char1/2/3)

Supplier
├─→ Item (1-to-many)
└─→ PurchaseOrder (1-to-many)
```

---

## 3. API Routes Design

### 3.1 Authentication Routes

```
POST   /api/auth/signup          // Create new user account (admin only)
POST   /api/auth/signin          // Login
POST   /api/auth/signout         // Logout
GET    /api/auth/session         // Get current session
POST   /api/auth/reset-password  // Reset password (admin only)
```

### 3.2 User Management Routes

```
GET    /api/users                // List all users (admin only)
GET    /api/users/:id            // Get user details
POST   /api/users                // Create user (admin only)
PUT    /api/users/:id            // Update user (admin only)
DELETE /api/users/:id            // Soft delete user (admin only)
GET    /api/users/me             // Get current user profile
PUT    /api/users/me/preferences // Update language/preferences
```

### 3.3 Items & Catalogue Routes

```
GET    /api/items                // List items (with search, filter, pagination)
GET    /api/items/:id            // Get item details
POST   /api/items                // Create item (admin only)
PUT    /api/items/:id            // Update item (admin only)
DELETE /api/items/:id            // Soft delete item (admin only)
GET    /api/items/search?q=      // Search items by name/sku/description
```

### 3.4 Suppliers Routes

```
GET    /api/suppliers            // List suppliers
GET    /api/suppliers/:id        // Get supplier details
POST   /api/suppliers            // Create supplier (admin only)
PUT    /api/suppliers/:id        // Update supplier (admin only)
DELETE /api/suppliers/:id        // Soft delete supplier (admin only)
```

### 3.5 Companies Routes

```
GET    /api/companies            // List companies
POST   /api/companies            // Create company (admin only)
PUT    /api/companies/:id        // Update company (admin only)
```

### 3.6 Characters (Dynamic Lists) Routes

```
GET    /api/characters?type=     // Get characters by type (character1/2/3)
POST   /api/characters           // Create character (admin only)
PUT    /api/characters/:id       // Update character (admin only)
DELETE /api/characters/:id       // Delete character (admin only)
```

### 3.7 Purchase Order Routes

```
GET    /api/purchase-orders      // List POs (filtered by user permissions)
GET    /api/purchase-orders/:id  // Get PO details
POST   /api/purchase-orders      // Create new PO
PUT    /api/purchase-orders/:id  // Update PO (only if DRAFT)
DELETE /api/purchase-orders/:id  // Delete PO (only if DRAFT)
POST   /api/purchase-orders/:id/submit     // Change status: DRAFT → PENDING/APPROVED
POST   /api/purchase-orders/:id/cancel     // Cancel PO
```

### 3.8 Approval Routes

```
GET    /api/approvals            // List approvals for current user
POST   /api/approvals/:id/approve         // Approve
POST   /api/approvals/:id/reject          // Reject with comments
POST   /api/approvals/:id/request-change  // Request changes
```

### 3.9 Reports & Analytics Routes

```
GET    /api/reports/dashboard               // Dashboard stats
GET    /api/reports/spending?filters=       // Spending report
GET    /api/reports/supplier-alert          // Suppliers over limit
GET    /api/reports/export?format=excel|pdf // Export report
```

### 3.10 System Configuration Routes

```
GET    /api/config                    // Get all config (admin only)
PUT    /api/config/:key               // Update config value (admin only)
POST   /api/config/logo               // Upload company logo (admin only)
POST   /api/config/test-smtp          // Test SMTP settings (admin only)
```

### 3.11 PDF & Document Routes

```
GET    /api/documents/cash-pay/:poId  // Generate/download Cash Pay PDF
GET    /api/documents/po/:poId        // Generate/download PO PDF
```

### 3.12 Backup & Restore Routes

```
POST   /api/backup/create             // Create backup file (admin only)
POST   /api/backup/restore            // Restore from backup (admin only)
GET    /api/backup/list               // List available backups (admin only)
```

---

## 4. Business Logic & Workflows

### 4.1 Purchase Order Creation Flow

```typescript
// Pseudocode

async function createPurchaseOrder(data: POFormData, userId: string) {
  // 1. Validate form data
  validatePOData(data);

  // 2. Generate PO Number
  const poNumber = await generatePONumber(); // Format: PO-20251020-0001

  // 3. Create PO in database
  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      date: data.date,
      supplierId: data.supplierId,
      companyId: data.companyId,
      remarks: data.remarks,
      createdById: userId,
      status: 'DRAFT',
      lineItems: {
        create: data.lineItems.map((item, index) => ({
          itemId: item.itemId,
          itemName: item.name,
          itemDescription: item.description,
          itemSku: item.sku,
          character1: item.character1,
          character2: item.character2,
          character3: item.character3,
          unitPrice: item.price,
          quantity: item.quantity,
          lineTotal: item.price * item.quantity,
          lineNumber: index + 1,
        })),
      },
    },
  });

  // 4. Calculate total
  const totalAmount = data.lineItems.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0
  );

  await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: { totalAmount },
  });

  // 5. Log audit
  await createAuditLog({
    userId,
    action: 'CREATE_PO',
    entityType: 'PurchaseOrder',
    entityId: po.id,
  });

  return po;
}
```

---

### 4.2 Purchase Order Submission & Approval Flow

```typescript
async function submitPurchaseOrder(poId: string, userId: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { createdBy: { include: { manager: true } } },
  });

  if (po.status !== 'DRAFT') {
    throw new Error('Only DRAFT POs can be submitted');
  }

  const user = po.createdBy;
  const totalAmount = po.totalAmount;

  // Check if auto-approve
  if (totalAmount <= user.approvalLimit) {
    // AUTO-APPROVE
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: 'APPROVED',
        submittedAt: new Date(),
        approvedAt: new Date(),
      },
    });

    // Trigger post-approval actions
    await onPOApproved(poId);

    return { status: 'APPROVED', message: 'Auto-approved' };
  } else {
    // NEEDS APPROVAL
    if (!user.manager) {
      throw new Error('User has no manager assigned for approval');
    }

    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: 'PENDING_APPROVAL',
        submittedAt: new Date(),
      },
    });

    // Create approval request
    await prisma.approval.create({
      data: {
        poId: poId,
        approverId: user.managerId,
        level: 1,
        status: 'PENDING',
      },
    });

    // Send notification to manager
    await sendApprovalNotification(user.managerId, poId);

    return { status: 'PENDING_APPROVAL', message: 'Sent for approval' };
  }
}
```

---

### 4.3 Approval Decision Flow

```typescript
async function approveOrReject(
  approvalId: string,
  approverId: string,
  decision: 'APPROVE' | 'REJECT' | 'CHANGE_REQUESTED',
  comments?: string
) {
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: {
      po: { include: { createdBy: true } },
      approver: { include: { manager: true } },
    },
  });

  if (approval.status !== 'PENDING') {
    throw new Error('Approval already processed');
  }

  const po = approval.po;
  const approver = approval.approver;

  // Update approval record
  await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: decision,
      comments,
      respondedAt: new Date(),
    },
  });

  if (decision === 'REJECT') {
    // REJECT: PO is rejected
    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: 'REJECTED' },
    });

    await sendRejectionNotification(po.createdById, po.id, comments);

    return { status: 'REJECTED' };

  } else if (decision === 'CHANGE_REQUESTED') {
    // CHANGE REQUESTED: Send back to creator
    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: 'CHANGE_REQUESTED' },
    });

    await sendChangeRequestNotification(po.createdById, po.id, comments);

    return { status: 'CHANGE_REQUESTED' };

  } else {
    // APPROVE: Check if needs next level
    const totalAmount = po.totalAmount;

    if (totalAmount <= approver.approvalLimit) {
      // Approver can fully approve
      await prisma.purchaseOrder.update({
        where: { id: po.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });

      await onPOApproved(po.id);

      return { status: 'APPROVED' };

    } else {
      // Need next level approval
      if (!approver.manager) {
        // No manager = final level, auto-approve (CTO level)
        await prisma.purchaseOrder.update({
          where: { id: po.id },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
          },
        });

        await onPOApproved(po.id);

        return { status: 'APPROVED' };
      }

      // Create next level approval
      await prisma.approval.create({
        data: {
          poId: po.id,
          approverId: approver.managerId,
          level: approval.level + 1,
          status: 'PENDING',
        },
      });

      await sendApprovalNotification(approver.managerId, po.id);

      return { status: 'PENDING_NEXT_LEVEL' };
    }
  }
}
```

---

### 4.4 Post-Approval Actions

```typescript
async function onPOApproved(poId: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      supplier: true,
      createdBy: true,
      lineItems: true,
      company: true,
    },
  });

  // 1. Generate Cash Pay PDF
  const cashPayPath = await generateCashPayPDF(po);
  await prisma.cashPay.create({
    data: {
      poId: po.id,
      pdfPath: cashPayPath,
      pdfFilename: `CashPay-${po.poNumber}.pdf`,
      approverName: 'Final Approver', // Get from last approval
    },
  });

  // 2. Generate PO PDF
  const poPdfPath = await generatePOPDF(po);

  // 3. Send email to supplier
  await sendEmail({
    to: po.supplier.email,
    subject: `Purchase Order ${po.poNumber}`,
    body: `Dear ${po.supplier.name},\n\nPlease find attached our purchase order.\n\nBest regards,\n${po.company.name}`,
    attachments: [poPdfPath],
    poId: po.id,
  });

  // 4. Send email to creator
  await sendEmail({
    to: po.createdBy.email,
    subject: `Your Purchase Order ${po.poNumber} has been approved`,
    body: `Your purchase order has been approved.\n\nPO Number: ${po.poNumber}\nTotal: ${po.totalAmount} NIS`,
    attachments: [poPdfPath],
    poId: po.id,
  });

  // 5. Log audit
  await createAuditLog({
    action: 'APPROVE_PO',
    entityType: 'PurchaseOrder',
    entityId: po.id,
  });
}
```

---

### 4.5 SKU Generation Logic

```typescript
function generateSKU(item: ItemCreateData): string {
  // Format: [YEAR][CHAR1-CODE][SEQUENCE]
  // Example: 2025-SRV-00123

  const year = new Date().getFullYear();
  const char1Code = item.character1?.substring(0, 3).toUpperCase() || 'GEN';

  // Get next sequence number for this year + category
  const lastSku = await prisma.item.findFirst({
    where: {
      sku: {
        startsWith: `${year}-${char1Code}-`,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  let sequence = 1;
  if (lastSku) {
    const lastSeq = parseInt(lastSku.sku.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `${year}-${char1Code}-${sequence.toString().padStart(5, '0')}`;
}
```

---

### 4.6 PO Number Generation

```typescript
async function generatePONumber(): Promise<string> {
  // Format: PO-YYYYMMDD-XXXX
  // Example: PO-20251020-0001

  const today = new Date();
  const dateStr = format(today, 'yyyyMMdd');

  const lastPO = await prisma.purchaseOrder.findFirst({
    where: {
      poNumber: {
        startsWith: `PO-${dateStr}-`,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  let sequence = 1;
  if (lastPO) {
    const lastSeq = parseInt(lastPO.poNumber.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `PO-${dateStr}-${sequence.toString().padStart(4, '0')}`;
}
```

---

## 5. Frontend Structure

### 5.1 App Router Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx              // Login page
│   └── layout.tsx                 // Auth layout (no nav)
│
├── (dashboard)/
│   ├── layout.tsx                 // Main layout (with nav, header)
│   ├── page.tsx                   // Dashboard home
│   │
│   ├── purchase-orders/
│   │   ├── page.tsx              // PO list
│   │   ├── new/
│   │   │   └── page.tsx          // Create new PO
│   │   └── [id]/
│   │       ├── page.tsx          // View/Edit PO
│   │       └── approve/
│   │           └── page.tsx      // Approval page
│   │
│   ├── items/
│   │   ├── page.tsx              // Items catalogue
│   │   └── [id]/
│   │       └── page.tsx          // Item details
│   │
│   ├── suppliers/
│   │   ├── page.tsx              // Suppliers list
│   │   └── [id]/
│   │       └── page.tsx          // Supplier details
│   │
│   ├── reports/
│   │   ├── page.tsx              // Reports home
│   │   ├── spending/
│   │   │   └── page.tsx          // Spending report
│   │   └── supplier-alerts/
│   │       └── page.tsx          // Supplier alerts
│   │
│   └── admin/
│       ├── page.tsx              // Admin home
│       ├── users/
│       │   ├── page.tsx          // Users list
│       │   └── [id]/
│       │       └── page.tsx      // User edit
│       ├── companies/
│       │   └── page.tsx          // Companies management
│       ├── characters/
│       │   └── page.tsx          // Dynamic lists management
│       ├── settings/
│       │   └── page.tsx          // System settings (SMTP, logo, etc.)
│       └── backup/
│           └── page.tsx          // Backup & restore
│
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts          // NextAuth.js handler
│   ├── users/
│   │   └── route.ts
│   ├── items/
│   │   └── route.ts
│   ├── suppliers/
│   │   └── route.ts
│   ├── purchase-orders/
│   │   └── route.ts
│   ├── approvals/
│   │   └── route.ts
│   ├── reports/
│   │   └── route.ts
│   ├── config/
│   │   └── route.ts
│   └── backup/
│       └── route.ts
│
└── layout.tsx                     // Root layout (providers)
```

---

### 5.2 Component Structure

```
components/
├── ui/                            // ShadCN UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── toast.tsx
│   └── ... (other ShadCN components)
│
├── layout/
│   ├── Header.tsx                 // Top header (user name, language)
│   ├── Sidebar.tsx                // Navigation sidebar
│   └── Footer.tsx
│
├── forms/
│   ├── POForm.tsx                 // Purchase Order form
│   ├── POLineItemsTable.tsx      // Line items table in PO form
│   ├── ItemForm.tsx               // Item create/edit form
│   ├── SupplierForm.tsx
│   └── UserForm.tsx
│
├── tables/
│   ├── POTable.tsx                // Purchase Orders list table
│   ├── ItemsTable.tsx
│   ├── SuppliersTable.tsx
│   └── UsersTable.tsx
│
├── dashboard/
│   ├── StatsCard.tsx              // Dashboard stat widget
│   ├── SpendingChart.tsx          // Chart component
│   └── SupplierAlert.tsx          // Alert component
│
├── approvals/
│   ├── ApprovalCard.tsx           // Approval request card
│   └── ApprovalHistory.tsx        // Show approval chain
│
├── pdf/
│   ├── CashPayDocument.tsx        // React-PDF template for Cash Pay
│   └── PODocument.tsx             // React-PDF template for PO
│
└── common/
    ├── SearchInput.tsx
    ├── Pagination.tsx
    ├── LanguageSwitcher.tsx
    ├── LoadingSpinner.tsx
    └── ErrorMessage.tsx
```

---

### 5.3 State Management

**React Query (TanStack Query)** for server state:

```typescript
// Example: hooks/usePurchaseOrders.ts

export function usePurchaseOrders(filters?: POFilters) {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: () => fetchPurchaseOrders(filters),
  });
}

export function useCreatePO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: POFormData) => createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}
```

**React Context** for global UI state:

```typescript
// contexts/LanguageContext.tsx
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('he');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
```

---

## 6. Authentication & Authorization

### 6.1 NextAuth.js Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          throw new Error('User not found or inactive');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

### 6.2 Authorization Middleware

```typescript
// middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/purchase-orders/:path*'],
};
```

---

## 7. PDF Generation

### 7.1 Cash Pay PDF Template

```typescript
// components/pdf/CashPayDocument.tsx

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  // ... more styles
});

export function CashPayDocument({ po, logo }: CashPayProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logo */}
        <View style={styles.header}>
          {logo && <Image src={logo} style={styles.logo} />}
          <Text style={styles.title}>Cash Pay - {po.poNumber}</Text>
        </View>

        {/* PO Details */}
        <View style={styles.section}>
          <Text>Supplier: {po.supplier.name}</Text>
          <Text>Date: {format(po.date, 'dd/MM/yyyy')}</Text>
          <Text>Company: {po.company.name}</Text>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol}>Item</Text>
            <Text style={styles.tableCol}>Qty</Text>
            <Text style={styles.tableCol}>Price</Text>
            <Text style={styles.tableCol}>Total</Text>
          </View>
          {po.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCol}>{item.itemName}</Text>
              <Text style={styles.tableCol}>{item.quantity}</Text>
              <Text style={styles.tableCol}>{item.unitPrice}</Text>
              <Text style={styles.tableCol}>{item.lineTotal}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.total}>
          <Text>Total Amount: {po.totalAmount} NIS</Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signature}>
          <Text>Approved by: _____________________</Text>
          <Text>Date: _____________</Text>
        </View>
      </Page>
    </Document>
  );
}
```

---

## 8. Email Service

### 8.1 Nodemailer Configuration

```typescript
// lib/email.ts

import nodemailer from 'nodemailer';
import { prisma } from './prisma';

async function getEmailTransporter() {
  const config = await prisma.systemConfig.findMany({
    where: {
      key: { in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from'] },
    },
  });

  const configMap = Object.fromEntries(
    config.map(c => [c.key, c.value])
  );

  return nodemailer.createTransport({
    host: configMap.smtp_host,
    port: parseInt(configMap.smtp_port || '587'),
    secure: parseInt(configMap.smtp_port || '587') === 465,
    auth: {
      user: configMap.smtp_user,
      pass: decrypt(configMap.smtp_password), // Decrypt password
    },
  });
}

export async function sendEmail({
  to,
  subject,
  body,
  attachments = [],
  poId,
}: SendEmailParams) {
  try {
    const transporter = await getEmailTransporter();
    const from = await getConfig('smtp_from');

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
      attachments: attachments.map(path => ({
        filename: path.split('/').pop(),
        path,
      })),
    });

    // Log success
    await prisma.emailLog.create({
      data: {
        poId,
        to,
        subject,
        body,
        attachments: JSON.stringify(attachments),
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log failure
    await prisma.emailLog.create({
      data: {
        poId,
        to,
        subject,
        body,
        status: 'FAILED',
        errorMessage: error.message,
      },
    });

    throw error;
  }
}
```

---

## 9. Backup & Restore

### 9.1 Backup Logic

```typescript
// lib/backup.ts

import fs from 'fs/promises';
import path from 'path';
import { prisma } from './prisma';

export async function createBackup(): Promise<string> {
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const backupDir = path.join(process.cwd(), 'backups');
  await fs.mkdir(backupDir, { recursive: true });

  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  // Export all data
  const data = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    users: await prisma.user.findMany(),
    suppliers: await prisma.supplier.findMany(),
    companies: await prisma.company.findMany(),
    characters: await prisma.character.findMany(),
    items: await prisma.item.findMany(),
    purchaseOrders: await prisma.purchaseOrder.findMany({
      include: { lineItems: true, approvals: true },
    }),
    systemConfig: await prisma.systemConfig.findMany(),
  };

  await fs.writeFile(backupFile, JSON.stringify(data, null, 2));

  return backupFile;
}

export async function restoreBackup(backupFile: string): Promise<void> {
  const content = await fs.readFile(backupFile, 'utf-8');
  const data = JSON.parse(content);

  // Clear all data (use transaction)
  await prisma.$transaction([
    prisma.approval.deleteMany(),
    prisma.pOLineItem.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.item.deleteMany(),
    prisma.character.deleteMany(),
    prisma.company.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.user.deleteMany(),
    prisma.systemConfig.deleteMany(),
  ]);

  // Restore data
  await prisma.user.createMany({ data: data.users });
  await prisma.supplier.createMany({ data: data.suppliers });
  await prisma.company.createMany({ data: data.companies });
  await prisma.character.createMany({ data: data.characters });
  await prisma.item.createMany({ data: data.items });
  await prisma.systemConfig.createMany({ data: data.systemConfig });

  // Restore POs (more complex due to relations)
  for (const po of data.purchaseOrders) {
    await prisma.purchaseOrder.create({
      data: {
        ...po,
        lineItems: { create: po.lineItems },
        approvals: { create: po.approvals },
      },
    });
  }
}
```

---

## 10. Internationalization (i18n)

### 10.1 next-intl Setup

```typescript
// i18n/request.ts

import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

```json
// i18n/messages/he.json
{
  "common": {
    "save": "שמור",
    "cancel": "בטל",
    "delete": "מחק",
    "edit": "ערוך",
    "search": "חפש"
  },
  "nav": {
    "dashboard": "לוח בקרה",
    "purchaseOrders": "הזמנות רכש",
    "items": "קטלוג פריטים",
    "suppliers": "ספקים",
    "reports": "דוחות",
    "admin": "ניהול"
  },
  "po": {
    "title": "הזמנת רכש",
    "number": "מספר הזמנה",
    "date": "תאריך",
    "supplier": "ספק",
    "company": "חברה",
    "total": "סכום כולל",
    "status": {
      "draft": "טיוטה",
      "pending": "ממתין לאישור",
      "approved": "מאושר",
      "rejected": "נדחה",
      "cancelled": "מבוטל"
    }
  }
}
```

---

## 11. Security Considerations

### 11.1 Password Security

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- No password stored in plain text
- Password reset only by admin

### 11.2 SMTP Password Encryption

```typescript
// lib/crypto.ts

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### 11.3 SQL Injection Protection

- Prisma ORM handles parameterized queries automatically
- No raw SQL queries without sanitization

### 11.4 XSS Protection

- React escapes content by default
- Use `dangerouslySetInnerHTML` sparingly
- Sanitize user input with libraries like `DOMPurify`

### 11.5 CSRF Protection

- NextAuth.js includes CSRF tokens by default
- API routes verify authentication

### 11.6 Rate Limiting

```typescript
// lib/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// For local: use in-memory rate limiter
const cache = new Map();

export const ratelimit = {
  limit: async (key: string) => {
    const now = Date.now();
    const requests = cache.get(key) || [];

    // Remove old requests (older than 1 minute)
    const recent = requests.filter((time: number) => now - time < 60000);

    if (recent.length >= 100) { // Max 100 requests per minute
      return { success: false };
    }

    recent.push(now);
    cache.set(key, recent);

    return { success: true };
  },
};
```

---

## 12. Performance Optimization

### 12.1 Database Indexes

Already defined in Prisma schema:
- User: email, managerId
- Item: sku, supplierId, character1Id
- PurchaseOrder: poNumber, createdById, supplierId, status, date
- Approval: poId, approverId, status

### 12.2 Pagination

```typescript
// API route example

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.item.count(),
  ]);

  return Response.json({
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
```

### 12.3 Caching Strategy

- React Query caches API responses (5 minutes default)
- Dashboard stats: cache 5 minutes
- Static lists (suppliers, companies): cache 10 minutes

---

## 13. Error Handling

### 13.1 API Error Response Format

```typescript
// lib/api-error.ts

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);

  return Response.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  );
}
```

### 13.2 Frontend Error Handling

```typescript
// components/common/ErrorBoundary.tsx

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 14. Testing Strategy (Optional)

### 14.1 Unit Tests

```typescript
// __tests__/lib/generateSKU.test.ts

import { generateSKU } from '@/lib/generateSKU';

describe('generateSKU', () => {
  it('should generate SKU in correct format', async () => {
    const sku = await generateSKU({
      character1: 'Service',
    });

    expect(sku).toMatch(/^\d{4}-SER-\d{5}$/);
  });
});
```

### 14.2 Integration Tests

```typescript
// __tests__/api/purchase-orders.test.ts

import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/purchase-orders/route';

describe('/api/purchase-orders', () => {
  it('should create a purchase order', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        supplierId: 'supplier-1',
        companyId: 'company-1',
        lineItems: [
          { itemId: 'item-1', quantity: 2, unitPrice: 100 },
        ],
      },
    });

    await POST(req);

    expect(res._getStatusCode()).toBe(201);
  });
});
```

---

## 15. Deployment Guide

### 15.1 Prerequisites

1. **Node.js** 18+ installed
2. **npm** or **yarn**
3. **Git** (optional, for updates)

### 15.2 Installation Steps

```bash
# 1. Clone/copy project to local server
cd /path/to/procurement

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env file:
# - DATABASE_URL="file:./procurement.db"
# - NEXTAUTH_SECRET="<generate-random-secret>"
# - NEXTAUTH_URL="http://localhost:3000"
# - ENCRYPTION_KEY="<32-byte-hex-key>"

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate deploy

# 6. Seed initial data (admin user, etc.)
npm run seed

# 7. Build for production
npm run build

# 8. Start server
npm run start
```

### 15.3 Running as Windows Service (Optional)

Use **NSSM** (Non-Sucking Service Manager):

```cmd
nssm install ProcurementSystem "C:\Program Files\nodejs\node.exe"
nssm set ProcurementSystem AppDirectory "C:\path\to\procurement"
nssm set ProcurementSystem AppParameters ".next\standalone\server.js"
nssm start ProcurementSystem
```

### 15.4 Accessing the System

- **Local**: http://localhost:3000
- **Network**: http://[server-ip]:3000

**Default admin login:**
- Email: admin@company.com
- Password: Admin123! (change immediately)

---

## 16. Environment Variables

```env
# .env

# Database
DATABASE_URL="file:./procurement.db"

# Authentication
NEXTAUTH_SECRET="<generate-with-openssl-rand-hex-32>"
NEXTAUTH_URL="http://localhost:3000"

# Encryption (for SMTP password)
ENCRYPTION_KEY="<generate-32-byte-hex-key>"

# App Config
NODE_ENV="production"
PORT=3000

# Logging
LOG_LEVEL="info"
```

---

## 17. File Storage Structure

```
procurement/
├── prisma/
│   ├── schema.prisma
│   └── procurement.db          // SQLite database file
│
├── uploads/
│   ├── logos/
│   │   └── company-logo.png
│   └── attachments/
│
├── pdfs/
│   ├── purchase-orders/
│   │   └── PO-20251020-0001.pdf
│   └── cash-pay/
│       └── CashPay-PO-20251020-0001.pdf
│
├── backups/
│   ├── backup-20251020-120000.json
│   └── backup-20251019-120000.json
│
└── logs/
    ├── app.log
    └── error.log
```

---

## 18. Monitoring & Logging

### 18.1 Winston Logger Setup

```typescript
// lib/logger.ts

import winston from 'winston';
import path from 'path';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'app.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### 18.2 Usage

```typescript
import logger from '@/lib/logger';

logger.info('User logged in', { userId: user.id });
logger.error('Failed to send email', { error: error.message });
```

---

## 19. Future Enhancements (Out of Scope for MVP)

1. **Multi-company budgets**: Track budget per company with alerts
2. **Advanced analytics**: ML predictions, spending trends
3. **Mobile app**: Native iOS/Android app
4. **E-signature integration**: DocuSign, Adobe Sign
5. **ERP integration**: SAP, Priority, etc.
6. **Supplier portal**: Suppliers can view orders, confirm receipt
7. **Purchase requisitions**: Pre-PO approval flow
8. **Contract management**: Track supplier contracts and renewals
9. **Inventory tracking**: Basic stock management
10. **Multi-currency**: Support USD, EUR, etc.

---

## 20. Summary

This technical specification provides a complete blueprint for building the Procurement System. Key highlights:

- **Tech Stack**: Next.js 14, NextAuth.js, SQLite, Prisma, Tailwind, ShadCN
- **Architecture**: Monolithic Next.js app with API routes, local SQLite database
- **Core Features**: PO creation, multi-level approval, PDF generation, email automation
- **Security**: Password hashing, SMTP encryption, CSRF protection, role-based access
- **Deployment**: Local server, fully offline-capable after setup

**Next Steps:**
1. Review and approve this specification
2. Create detailed implementation plan (tasks.md)
3. Begin development in phases (Setup → Core Features → Enhancements)

---

**Document Status:** Ready for Review
**Estimated Development Time:** 8-10 weeks (MVP)
