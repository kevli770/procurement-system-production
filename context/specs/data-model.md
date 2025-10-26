# Data Model Design
# מודל הנתונים - Procurement System

**Version:** 1.0
**Date:** 2025-10-20

---

## 1. Entity Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  User ──────┐                                                        │
│     │       │                                                        │
│     │       └──→ User (manager/subordinates - hierarchy)            │
│     │                                                                │
│     │                                                                │
│     ├──→ PurchaseOrder (created by)                                 │
│     │         │                                                      │
│     │         ├──→ Supplier                                          │
│     │         ├──→ Company                                           │
│     │         ├──→ POLineItem (many)                                 │
│     │         │       └──→ Item                                      │
│     │         │                                                      │
│     │         ├──→ Approval (many - approval chain)                 │
│     │         │       └──→ User (approver)                          │
│     │         │                                                      │
│     │         ├──→ CashPay (1-to-1)                                 │
│     │         └──→ EmailLog (many)                                   │
│     │                                                                │
│     └──→ Approval (as approver)                                     │
│                                                                      │
│                                                                      │
│  Item ──────┐                                                        │
│     │       │                                                        │
│     ├──→ Supplier                                                    │
│     ├──→ Character (char1)                                           │
│     ├──→ Character (char2)                                           │
│     ├──→ Character (char3)                                           │
│     └──→ POLineItem (many)                                           │
│                                                                      │
│                                                                      │
│  Supplier ──┐                                                        │
│     │       │                                                        │
│     ├──→ Item (many)                                                 │
│     └──→ PurchaseOrder (many)                                        │
│                                                                      │
│                                                                      │
│  Company ──→ PurchaseOrder (many)                                    │
│                                                                      │
│                                                                      │
│  Character ──┐                                                       │
│     │        │                                                       │
│     ├──→ Item (as char1 - many)                                      │
│     ├──→ Item (as char2 - many)                                      │
│     └──→ Item (as char3 - many)                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      SUPPORTING ENTITIES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SystemConfig (key-value configuration)                              │
│  AuditLog (activity tracking)                                        │
│  Session, Account, VerificationToken (NextAuth.js)                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Entity Descriptions

### 2.1 User

**Purpose:** Represents system users with authentication, authorization, and hierarchy.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| email | String | User email | Unique, required |
| name | String | Full name | Required |
| passwordHash | String | Bcrypt hashed password | Required |
| role | Enum | USER, MANAGER, ADMIN, SUPER_ADMIN | Default: USER |
| approvalLimit | Decimal | Max amount user can approve (NIS) | Default: 0 |
| isActive | Boolean | Account status | Default: true |
| managerId | String | Reference to manager | FK to User, nullable |
| language | String | UI language preference | Default: "he" |
| createdAt | DateTime | Account creation time | Auto |
| updatedAt | DateTime | Last update time | Auto |
| lastLoginAt | DateTime | Last login timestamp | Nullable |

**Relations:**
- `manager` → User (self-relation for hierarchy)
- `subordinates` → User[] (reverse relation)
- `createdPOs` → PurchaseOrder[]
- `approvals` → Approval[]

**Business Rules:**
- Email must be unique
- All users must have a manager EXCEPT one top-level user (CTO/SUPER_ADMIN)
- Approval limit = 0 means cannot auto-approve any PO
- SUPER_ADMIN has unlimited approval (treated as infinity)

**Indexes:**
- email (unique)
- managerId (for hierarchy queries)

---

### 2.2 Supplier

**Purpose:** Stores supplier information for purchasing.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| name | String | Supplier name (Hebrew) | Required |
| nameEn | String | Supplier name (English) | Optional |
| email | String | Contact email | Required, valid email |
| phone | String | Phone number | Optional |
| contactPerson | String | Contact person name | Optional |
| taxId | String | Tax ID (ח.פ / ע.מ) | Optional |
| address | String | Physical address | Optional |
| remarks | String | Additional notes | Optional |
| isActive | Boolean | Supplier status | Default: true |
| createdAt | DateTime | Creation time | Auto |
| updatedAt | DateTime | Last update time | Auto |

**Relations:**
- `items` → Item[] (items from this supplier)
- `purchaseOrders` → PurchaseOrder[] (orders to this supplier)

**Business Rules:**
- Email is required for sending approved POs
- Soft delete: set isActive = false instead of deleting

**Indexes:**
- email (for lookups)

---

### 2.3 Company

**Purpose:** Represents companies in the group (for charging purchases).

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| name | String | Company name (Hebrew) | Required |
| nameEn | String | Company name (English) | Optional |
| taxId | String | Tax ID (ח.פ) | Optional |
| isActive | Boolean | Company status | Default: true |
| createdAt | DateTime | Creation time | Auto |
| updatedAt | DateTime | Last update time | Auto |

**Relations:**
- `purchaseOrders` → PurchaseOrder[]

**Business Rules:**
- Used for grouping/reporting
- Future: can add budget tracking per company

---

### 2.4 Character

**Purpose:** Dynamic classification lists for items (Service/Item/Manpower, etc.).

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| type | String | "character1", "character2", "character3" | Required |
| value | String | Display value (Hebrew) | Required |
| valueEn | String | Display value (English) | Optional |
| order | Int | Display order | Default: 0 |
| isActive | Boolean | Status | Default: true |
| createdAt | DateTime | Creation time | Auto |
| updatedAt | DateTime | Last update time | Auto |

**Relations:**
- `itemsChar1` → Item[] (items using this as character1)
- `itemsChar2` → Item[] (items using this as character2)
- `itemsChar3` → Item[] (items using this as character3)

**Business Rules:**
- `type` + `value` must be unique (compound unique constraint)
- Character1 values: "Service", "Item", "Manpower" (default)
- Character2/3: fully dynamic, admin-defined

**Indexes:**
- type (for filtering by type)

**Example Data:**
```
character1:
- Service
- Item
- Manpower

character2:
- Hardware
- Software
- Cloud Service
- Consulting

character3:
- Critical
- Standard
- Low Priority
```

---

### 2.5 Item

**Purpose:** Catalogue of purchasable items/services.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| sku | String | Auto-generated SKU | Unique, format: YYYY-CAT-XXXXX |
| name | String | Item name (Hebrew) | Required |
| nameEn | String | Item name (English) | Optional |
| description | String | Description (Hebrew) | Optional |
| descriptionEn | String | Description (English) | Optional |
| character1Id | String | Classification 1 | FK to Character, nullable |
| character2Id | String | Classification 2 | FK to Character, nullable |
| character3Id | String | Classification 3 | FK to Character, nullable |
| suggestedPrice | Decimal | Suggested price (NIS) | Default: 0 |
| isOneTimePurchase | Boolean | One-time or recurring | Default: true |
| validFrom | DateTime | Valid from date | Nullable |
| validTo | DateTime | Valid to date | Nullable |
| supplierId | String | Default supplier | FK to Supplier, nullable |
| remarks | String | Additional notes | Optional |
| isActive | Boolean | Item status | Default: true |
| createdAt | DateTime | Creation time | Auto |
| updatedAt | DateTime | Last update time | Auto |

**Relations:**
- `supplier` → Supplier
- `character1` → Character
- `character2` → Character
- `character3` → Character
- `poLines` → POLineItem[]

**Business Rules:**
- SKU auto-generated on creation (cannot be edited)
- SKU format: `YYYY-CAT-XXXXX` (e.g., 2025-SRV-00001)
  - YYYY = year
  - CAT = first 3 letters of character1 (or "GEN")
  - XXXXX = sequential number (padded to 5 digits)
- If validFrom/validTo set, item only available in that period
- Suggested price is default, can be overridden in PO line
- Soft delete: set isActive = false

**Indexes:**
- sku (unique, for quick lookup)
- supplierId (for supplier filtering)
- character1Id (for classification filtering)

---

### 2.6 PurchaseOrder

**Purpose:** Main entity for purchase orders.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| poNumber | String | Auto-generated PO number | Unique, format: PO-YYYYMMDD-XXXX |
| date | DateTime | PO date | Default: now() |
| supplierId | String | Supplier reference | FK to Supplier, required |
| companyId | String | Company reference | FK to Company, required |
| remarks | String | Additional notes | Optional |
| createdById | String | Creator user | FK to User, required |
| status | Enum | PO status | Default: DRAFT |
| totalAmount | Decimal | Total amount (NIS) | Default: 0, calculated |
| createdAt | DateTime | Creation time | Auto |
| updatedAt | DateTime | Last update time | Auto |
| submittedAt | DateTime | Submission time (DRAFT→FINAL) | Nullable |
| approvedAt | DateTime | Final approval time | Nullable |

**Relations:**
- `supplier` → Supplier
- `company` → Company
- `createdBy` → User
- `lineItems` → POLineItem[] (1-to-many)
- `approvals` → Approval[] (approval chain)
- `cashPayDoc` → CashPay (1-to-1)
- `emailLogs` → EmailLog[]

**Status Enum:**
- `DRAFT` - User is editing (can be saved/edited)
- `PENDING_APPROVAL` - Submitted, waiting for approval
- `APPROVED` - Fully approved (locked)
- `REJECTED` - Rejected by approver (locked)
- `CANCELLED` - Cancelled by creator (locked)
- `CHANGE_REQUESTED` - Approver requested changes (can edit again)

**Business Rules:**
- PO number auto-generated: `PO-YYYYMMDD-XXXX`
  - YYYYMMDD = date (e.g., 20251020)
  - XXXX = sequential number for that day (e.g., 0001)
- Total amount = sum of line items' lineTotal
- Status transitions:
  - DRAFT → PENDING_APPROVAL (if needs approval)
  - DRAFT → APPROVED (if auto-approved)
  - DRAFT → CANCELLED (by creator)
  - PENDING_APPROVAL → APPROVED / REJECTED / CHANGE_REQUESTED (by approver)
  - CHANGE_REQUESTED → DRAFT (user can edit again)
- Cannot edit PO if status is: APPROVED, REJECTED, CANCELLED, PENDING_APPROVAL
- Can only edit if status is: DRAFT, CHANGE_REQUESTED

**Indexes:**
- poNumber (unique, for quick lookup)
- createdById (for user's PO list)
- supplierId (for supplier reports)
- status (for filtering)
- date (for date range queries)

---

### 2.7 POLineItem

**Purpose:** Individual line items in a purchase order (snapshot of item data).

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| poId | String | Parent PO | FK to PurchaseOrder, required |
| itemId | String | Reference to item | FK to Item, nullable |
| itemName | String | Item name (snapshot) | Required |
| itemDescription | String | Description (snapshot) | Optional |
| itemSku | String | SKU (snapshot) | Optional |
| character1 | String | Character1 (snapshot) | Optional |
| character2 | String | Character2 (snapshot) | Optional |
| character3 | String | Character3 (snapshot) | Optional |
| unitPrice | Decimal | Price per unit (NIS) | Required |
| quantity | Decimal | Quantity | Default: 1 |
| lineTotal | Decimal | Total for line (price × qty) | Required, calculated |
| lineNumber | Int | Line number (1, 2, 3...) | Required |
| createdAt | DateTime | Creation time | Auto |
| updatedAt | DateTime | Last update time | Auto |

**Relations:**
- `po` → PurchaseOrder
- `item` → Item (nullable, for reference)

**Business Rules:**
- Snapshot pattern: Item data is copied to line at creation time
- If item is later changed/deleted, line item remains unchanged (historical record)
- itemId is nullable because item might be deleted from catalogue
- lineTotal = unitPrice × quantity (calculated)
- unitPrice can differ from item's suggestedPrice (user can override)

**Indexes:**
- poId (for fetching lines of a PO)
- itemId (for item usage reports)

---

### 2.8 Approval

**Purpose:** Tracks approval workflow for purchase orders.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| poId | String | PO being approved | FK to PurchaseOrder, required |
| approverId | String | Approver user | FK to User, required |
| level | Int | Approval level (1, 2, 3, 4) | Required |
| status | Enum | Approval status | Default: PENDING |
| comments | String | Rejection/change request comments | Optional |
| createdAt | DateTime | Approval request time | Auto |
| respondedAt | DateTime | Decision time | Nullable |

**Relations:**
- `po` → PurchaseOrder
- `approver` → User

**Status Enum:**
- `PENDING` - Waiting for approver decision
- `APPROVED` - Approved by this approver
- `REJECTED` - Rejected by this approver
- `CHANGE_REQUESTED` - Approver requested changes

**Business Rules:**
- Each approval represents one step in the chain
- Level indicates hierarchy depth (1 = first manager, 2 = second, etc.)
- Only one PENDING approval at a time per PO
- When APPROVED: check if needs next level or final approval
- When REJECTED/CHANGE_REQUESTED: PO status updated, no more approvals

**Indexes:**
- poId (for fetching approval chain)
- approverId (for user's approval queue)
- status (for filtering pending approvals)

---

### 2.9 CashPay

**Purpose:** PDF document for cash payment approval (generated after PO approval).

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| poId | String | Related PO | FK to PurchaseOrder, unique |
| pdfPath | String | File path on server | Required |
| pdfFilename | String | File name | Required |
| approverName | String | Final approver name | Required |
| approverTitle | String | Approver job title | Optional |
| createdAt | DateTime | Generation time | Auto |

**Relations:**
- `po` → PurchaseOrder (1-to-1)

**Business Rules:**
- Created automatically when PO reaches APPROVED status
- PDF stored in `/pdfs/cash-pay/` directory
- File name format: `CashPay-{PO_NUMBER}.pdf`
- Includes signature section for manual signing

**Indexes:**
- poId (unique, 1-to-1 relation)

---

### 2.10 EmailLog

**Purpose:** Log of all emails sent by the system.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| poId | String | Related PO (if applicable) | FK to PurchaseOrder, nullable |
| to | String | Recipient email | Required |
| subject | String | Email subject | Required |
| body | String | Email body | Optional |
| attachments | String | JSON array of file paths | Optional |
| status | Enum | Email status | Default: PENDING |
| errorMessage | String | Error details (if failed) | Optional |
| createdAt | DateTime | Email queued time | Auto |
| sentAt | DateTime | Email sent time | Nullable |

**Relations:**
- `po` → PurchaseOrder

**Status Enum:**
- `PENDING` - Queued, not sent yet
- `SENT` - Successfully sent
- `FAILED` - Failed to send

**Business Rules:**
- All emails logged for audit trail
- Attachments stored as JSON array: `["path/to/file1.pdf", "path/to/file2.pdf"]`
- If status = FAILED, errorMessage contains reason

**Indexes:**
- poId (for PO email history)
- status (for filtering failed emails)

---

### 2.11 SystemConfig

**Purpose:** Key-value store for system configuration.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| key | String | Config key | Unique, required |
| value | String | Config value (JSON for complex) | Required |
| description | String | Human-readable description | Optional |
| updatedAt | DateTime | Last update time | Auto |

**Common Keys:**
- `smtp_host` - SMTP server host
- `smtp_port` - SMTP port (587, 465, etc.)
- `smtp_user` - SMTP username
- `smtp_password` - Encrypted SMTP password
- `smtp_from` - From email address
- `company_logo` - Base64 or file path to logo
- `sku_format` - SKU generation format
- `po_number_format` - PO number format
- `default_language` - Default UI language ("he" or "en")
- `alert_supplier_limit` - Supplier spending alert threshold (default: 100000)

**Business Rules:**
- Key is unique (only one value per key)
- Value is string, but can store JSON for complex objects
- Sensitive values (passwords) should be encrypted before storing

---

### 2.12 AuditLog

**Purpose:** Track all important actions in the system.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | PK, CUID |
| userId | String | User who performed action | Optional |
| action | String | Action name | Required |
| entityType | String | Entity type affected | Optional |
| entityId | String | Entity ID affected | Optional |
| changes | String | JSON of before/after values | Optional |
| ipAddress | String | User IP address | Optional |
| userAgent | String | User browser/client | Optional |
| createdAt | DateTime | Action time | Auto |

**Action Examples:**
- `CREATE_PO` - Created purchase order
- `UPDATE_PO` - Updated purchase order
- `SUBMIT_PO` - Submitted PO for approval
- `APPROVE_PO` - Approved purchase order
- `REJECT_PO` - Rejected purchase order
- `CREATE_ITEM` - Created item
- `UPDATE_ITEM` - Updated item
- `CREATE_USER` - Created user
- `LOGIN` - User logged in
- `LOGOUT` - User logged out
- `BACKUP_CREATED` - Backup created
- `BACKUP_RESTORED` - Backup restored

**Business Rules:**
- Log every create/update/delete operation
- Log authentication events
- Log approval decisions
- Changes field stores JSON: `{ "before": {...}, "after": {...} }`

**Indexes:**
- userId (for user activity)
- entityType (for filtering by type)
- createdAt (for time-based queries)

---

## 3. Database Relationships Summary

### 3.1 One-to-Many Relationships

```
User → PurchaseOrder (createdBy)
  One user creates many purchase orders

Supplier → Item
  One supplier provides many items

Supplier → PurchaseOrder
  One supplier receives many purchase orders

Company → PurchaseOrder
  One company has many purchase orders

Item → POLineItem
  One item appears in many PO lines (snapshot)

PurchaseOrder → POLineItem
  One PO has many line items

PurchaseOrder → Approval
  One PO has many approval steps

PurchaseOrder → EmailLog
  One PO can trigger many emails

User → Approval
  One user approves many POs

Character → Item (x3)
  One character value used by many items (char1/2/3)
```

### 3.2 One-to-One Relationships

```
PurchaseOrder → CashPay
  One PO generates one Cash Pay document
```

### 3.3 Self-Referencing Relationships

```
User → User (manager/subordinates)
  User can have one manager
  User can have many subordinates
  Creates hierarchy tree
```

### 3.4 Many-to-Many Relationships

**None in this design** - all M2M resolved through junction tables or denormalization.

---

## 4. Data Integrity Rules

### 4.1 Cascade Delete Rules

```
User deleted → Throw error (cannot delete if has POs or approvals)
  OR: Soft delete (set isActive = false)

Supplier deleted → Soft delete (set isActive = false)
  Items still reference supplier (historical)
  POs still reference supplier (historical)

Item deleted → Soft delete (set isActive = false)
  POLineItems still reference item (snapshot preserved)

PurchaseOrder deleted → CASCADE DELETE:
  - All POLineItems deleted
  - All Approvals deleted
  - CashPay deleted
  - EmailLogs deleted
  (Only allow if status = DRAFT)

Company deleted → Throw error (cannot delete if has POs)
  OR: Soft delete (set isActive = false)

Character deleted → Throw error (cannot delete if used by items)
  OR: Set item references to null
```

### 4.2 Validation Rules

**User:**
- Email must be valid format and unique
- Password must be hashed (never plain text)
- approvalLimit ≥ 0
- SUPER_ADMIN can have managerId = null, others must have manager

**Supplier:**
- Email must be valid format
- Phone must be valid format (if provided)

**Item:**
- SKU must be unique (auto-generated)
- suggestedPrice ≥ 0
- If validFrom and validTo set, validFrom < validTo

**PurchaseOrder:**
- poNumber must be unique (auto-generated)
- totalAmount = sum of lineItems.lineTotal
- Cannot change status from APPROVED/REJECTED/CANCELLED

**POLineItem:**
- unitPrice > 0
- quantity > 0
- lineTotal = unitPrice × quantity

**Approval:**
- level must be 1, 2, 3, or 4
- Cannot approve if not the current pending approver

---

## 5. Sample Data

### 5.1 Initial Seed Data

**Users:**
```
1. CTO (SUPER_ADMIN)
   - Email: cto@company.com
   - Approval Limit: Unlimited
   - Manager: None

2. IT Manager (MANAGER)
   - Email: it-manager@company.com
   - Approval Limit: 50,000 NIS
   - Manager: CTO

3. Team Lead (MANAGER)
   - Email: team-lead@company.com
   - Approval Limit: 10,000 NIS
   - Manager: IT Manager

4. Developer (USER)
   - Email: developer@company.com
   - Approval Limit: 2,000 NIS
   - Manager: Team Lead
```

**Characters:**
```
Character1 (type="character1"):
- Service
- Item
- Manpower

Character2 (type="character2"):
- Hardware
- Software
- Cloud Service
- Consulting
- Training

Character3 (type="character3"):
- Critical
- Standard
- Low Priority
```

**Suppliers:**
```
1. Microsoft Israel
   - Email: orders@microsoft.co.il
   - Tax ID: 123456789

2. Dell Israel
   - Email: sales@dell.co.il
   - Tax ID: 987654321

3. AWS
   - Email: billing@aws.com
   - Tax ID: INT123456
```

**Companies:**
```
1. Company A (main)
2. Company B (subsidiary)
3. Company C (subsidiary)
```

**Items:**
```
1. Office 365 License
   - SKU: 2025-SRV-00001
   - Character1: Service
   - Character2: Software
   - Suggested Price: 50 NIS/month
   - Supplier: Microsoft

2. Dell Laptop
   - SKU: 2025-ITE-00001
   - Character1: Item
   - Character2: Hardware
   - Suggested Price: 5,000 NIS
   - Supplier: Dell

3. AWS EC2 Instance
   - SKU: 2025-SRV-00002
   - Character1: Service
   - Character2: Cloud Service
   - Suggested Price: 500 NIS/month
   - Supplier: AWS
```

---

## 6. Indexes & Performance

### 6.1 Critical Indexes

```sql
-- User
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_manager ON User(managerId);

-- Item
CREATE UNIQUE INDEX idx_item_sku ON Item(sku);
CREATE INDEX idx_item_supplier ON Item(supplierId);
CREATE INDEX idx_item_char1 ON Item(character1Id);

-- Supplier
CREATE INDEX idx_supplier_email ON Supplier(email);

-- PurchaseOrder
CREATE UNIQUE INDEX idx_po_number ON PurchaseOrder(poNumber);
CREATE INDEX idx_po_creator ON PurchaseOrder(createdById);
CREATE INDEX idx_po_supplier ON PurchaseOrder(supplierId);
CREATE INDEX idx_po_status ON PurchaseOrder(status);
CREATE INDEX idx_po_date ON PurchaseOrder(date);

-- POLineItem
CREATE INDEX idx_poline_po ON POLineItem(poId);
CREATE INDEX idx_poline_item ON POLineItem(itemId);

-- Approval
CREATE INDEX idx_approval_po ON Approval(poId);
CREATE INDEX idx_approval_user ON Approval(approverId);
CREATE INDEX idx_approval_status ON Approval(status);

-- AuditLog
CREATE INDEX idx_audit_user ON AuditLog(userId);
CREATE INDEX idx_audit_entity ON AuditLog(entityType);
CREATE INDEX idx_audit_date ON AuditLog(createdAt);
```

### 6.2 Query Optimization Tips

1. **PO List**: Always filter by user (createdById) or approver (join Approval)
2. **Dashboard**: Use date range filters + status filters
3. **Reports**: Add compound indexes for common filter combinations
4. **Audit Log**: Partition by date if grows very large (future)

---

## 7. Data Migration & Backup Strategy

### 7.1 Backup Content

Full backup includes:
- All tables (JSON export)
- File paths reference (PDFs, logos)
- System configuration

**Backup file structure:**
```json
{
  "version": "1.0",
  "timestamp": "2025-10-20T12:00:00Z",
  "users": [...],
  "suppliers": [...],
  "companies": [...],
  "characters": [...],
  "items": [...],
  "purchaseOrders": [
    {
      "...": "...",
      "lineItems": [...],
      "approvals": [...]
    }
  ],
  "systemConfig": [...]
}
```

### 7.2 Restore Strategy

1. Backup current DB before restore
2. Delete all data (in correct order to respect FK constraints)
3. Restore data (in correct order)
4. Verify data integrity
5. Re-index if needed

**Order of deletion (respect FK):**
```
1. Approval
2. POLineItem
3. CashPay
4. EmailLog
5. PurchaseOrder
6. Item
7. Character
8. Company
9. Supplier
10. Session, Account
11. User
12. SystemConfig
13. AuditLog
```

**Order of restoration (reverse):**
```
1. SystemConfig
2. User
3. Supplier
4. Company
5. Character
6. Item
7. PurchaseOrder (with lineItems, approvals)
```

---

## 8. Future Enhancements

### 8.1 Phase 2 Additions (Out of MVP Scope)

**Budget Tracking:**
```
Company {
  + monthlyBudget: Decimal
  + currentSpend: Decimal (calculated)
}

Budget {
  id, companyId, year, month, amount, spent
}
```

**Contract Management:**
```
Contract {
  id, supplierId, startDate, endDate, amount, terms, status
}

PurchaseOrder {
  + contractId: FK to Contract
}
```

**Inventory Tracking:**
```
InventoryItem {
  id, itemId, quantity, location, lastChecked
}

POLineItem {
  + receivedQuantity
  + receivedDate
}
```

---

## Summary

This data model provides:
- ✅ Complete user management with hierarchy
- ✅ Flexible item catalogue with dynamic classifications
- ✅ Multi-level approval workflow
- ✅ Historical data preservation (snapshot pattern)
- ✅ Audit trail for all actions
- ✅ Email logging
- ✅ System configuration storage
- ✅ Backup/restore support

**Key Design Decisions:**
1. **Snapshot Pattern**: PO line items copy item data to preserve history
2. **Soft Delete**: Items, suppliers, users are marked inactive, not deleted
3. **Self-Referencing Hierarchy**: Users form tree structure for approvals
4. **Dynamic Characters**: Flexible classification system via Character table
5. **Approval Chain**: Separate Approval records for each step (audit trail)
6. **Configuration KV Store**: Flexible system config without schema changes

---

**Next Step:** Create implementation plan (tasks.md) with phased development approach.
