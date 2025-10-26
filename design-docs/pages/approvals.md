# Approvals Page Design

## Purpose
Display all pending approvals for the current user with action buttons to approve/reject.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Pending Approvals"                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Approvals Data Table                                    │
│ - PO Number                                             │
│ - Date                                                  │
│ - Supplier                                              │
│ - Company                                               │
│ - Total Amount                                          │
│ - Created By                                            │
│ - Status (Badge)                                        │
│ - Actions (Approve/Reject buttons)                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Main Table
- **data-table** - **advanced**: Approvals table
  - Sortable columns
  - Real-time status updates
  - Row-level actions
  - Pagination support

### Action Buttons
- **button** - **standard**: Approve button (success/green variant)
- **button** - **destructive**: Reject button

### Status Badges
- **badge** - **standard**: Status indicators
  - PENDING: default variant (blue)
  - APPROVED: default variant (green)
  - REJECTED: destructive variant (red)

### Dialogs
- **dialog** - **standard**: Confirm approval dialog
  - Display PO details summary
  - Optional approval notes field
  - Confirm/Cancel buttons

- **dialog** - **standard**: Reject reason dialog
  - Required textarea for rejection reason
  - Confirm/Cancel buttons

### Empty State
- **empty** - **data**: When no pending approvals
  - Icon display
  - "No pending approvals" message
  - Optional "View all orders" link

## Data Integration Points
- `/api/approvals` - All pending approvals for current user
- `/api/approvals/[id]` PUT - Approve/reject approval

## Validation Rules
- Rejection reason: Required when rejecting
- User must have approval rights for the specific level

## User Interaction
- Click Approve → Open confirmation dialog → Submit approval
- Click Reject → Open rejection dialog with required reason → Submit rejection
- Sort by columns → Re-fetch with sort params
- View PO details → Navigate to /purchase-orders/[id]

## Hebrew RTL Support
- All text in Hebrew
- Table reads right-to-left
- Dialog layout in RTL

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/data-table
- https://www.kibo-ui.com/patterns/button
- https://www.kibo-ui.com/patterns/badge
- https://www.kibo-ui.com/patterns/dialog
- https://www.kibo-ui.com/patterns/empty
