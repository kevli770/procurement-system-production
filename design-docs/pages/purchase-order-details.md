# Purchase Order Details/Edit Page Design

## Purpose
View purchase order details, edit if in DRAFT status, and download PDF.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Purchase Order #{poNumber}"                    │
│ Actions: [Back] [Download PDF] [Edit/Save] [Delete]    │
├─────────────────────────────────────────────────────────┤
│ Order Details Card                                      │
│ - Status Badge (prominent)                              │
│ - PO Number, Date                                       │
│ - Supplier, Company                                     │
│ - Created By, Created At                                │
│ - Remarks                                               │
├─────────────────────────────────────────────────────────┤
│ Line Items Card                                         │
│ - Items Table (read-only or editable based on status)  │
│ - Grand Total                                           │
├─────────────────────────────────────────────────────────┤
│ Approval History Card (if approved/rejected)            │
│ - Timeline of approvals                                 │
│ - Approver names, dates, decisions                      │
│ - Rejection reasons if applicable                       │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Action Buttons
- **button** - **outline**: Back button
- **button** - **standard**: Download PDF button with download icon
- **button** - **standard**: Edit/Save button (conditional)
- **button** - **destructive**: Delete button (DRAFT only)

### Status Display
- **badge** - **large**: Prominent status badge at top
  - DRAFT: secondary variant
  - PENDING_APPROVAL: default variant (blue)
  - APPROVED: default variant (green)
  - REJECTED: destructive variant (red)
  - CANCELLED: outline variant

### Information Cards
- **card** - **standard**: Order details container
  - Read-only display with labels and values
  - Two-column layout for better space usage

- **card** - **standard**: Line items container
  - Table or list of line items
  - Totals row

- **card** - **standard**: Approval history container (conditional)
  - Timeline component integration
  - Expandable details per approval

### Line Items Display
- **data-table** - **standard**: Line items table (read-only mode)
  - Columns: SKU, Name, Description, Unit Price, Quantity, Total
  - No actions, pure display

### Approval Timeline
- **timeline** - **standard**: Approval history visualization
  - Chronological display
  - Approver info, timestamp, decision
  - Notes/reasons display

### Dialogs
- **dialog** - **standard**: Confirm delete dialog
  - Warning message
  - Confirm/Cancel buttons

- **dialog** - **standard**: Confirm submit for approval
  - Summary of PO details
  - Confirm/Cancel buttons

## Data Integration Points
- `/api/purchase-orders/[id]` GET - Fetch PO details
- `/api/purchase-orders/[id]` PUT - Update PO (if DRAFT)
- `/api/purchase-orders/[id]` DELETE - Delete PO (if DRAFT)
- `/api/purchase-orders/[id]/pdf` GET - Download PDF

## Validation Rules
- Only DRAFT orders can be edited
- Only creator or ADMIN/SUPER_ADMIN can delete
- PDF available for all statuses

## User Interaction
- View mode → Display all details read-only
- Edit mode (DRAFT only) → Enable inline editing of line items
- Download PDF → Trigger PDF download
- Delete (DRAFT only) → Confirm dialog → Delete and redirect
- Submit for Approval → Confirm dialog → Update status → Redirect

## Hebrew RTL Support
- All labels in Hebrew
- Cards layout in RTL
- Timeline reads right-to-left

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/button
- https://www.kibo-ui.com/patterns/badge
- https://www.kibo-ui.com/patterns/card
- https://www.kibo-ui.com/patterns/data-table
- https://www.kibo-ui.com/patterns/timeline
- https://www.kibo-ui.com/patterns/dialog
