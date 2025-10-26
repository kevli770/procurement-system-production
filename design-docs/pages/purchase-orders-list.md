# Purchase Orders List Page Design

## Purpose
Display all purchase orders with filtering, status badges, and quick actions.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header with "New Order" button                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Purchase Orders Data Table                              │
│ - PO Number                                             │
│ - Date                                                  │
│ - Supplier                                              │
│ - Company                                               │
│ - Total Amount                                          │
│ - Status (Badge)                                        │
│ - Created By                                            │
│ - Actions (View button)                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Page Header
- **button** - **standard**: "New Order" button with Plus icon
  - Primary/accent styling
  - Navigate to /purchase-orders/new

### Main Table
- **data-table** - **advanced**: Full purchase orders table
  - Sortable columns
  - Status filtering
  - Pagination support
  - Row actions (View)

### Status Badges
- **badge** - **standard**: Status indicators
  - DRAFT: secondary variant (yellow)
  - PENDING_APPROVAL: default variant (blue)
  - APPROVED: default variant (green)
  - REJECTED: destructive variant (red)
  - CANCELLED: outline variant (gray)

### Empty State
- **empty** - **data**: When no purchase orders exist
  - Icon display
  - "No orders yet" message
  - "Create first order" call-to-action button

## Data Integration Points
- `/api/purchase-orders` - All purchase orders with filtering

## User Interaction
- Click "New Order" → Navigate to /purchase-orders/new
- Click View button → Navigate to /purchase-orders/[id]
- Sort by columns → Re-fetch with sort params
- Filter by status → Update table display

## Hebrew RTL Support
- All text in Hebrew
- Table reads right-to-left
- Status labels in Hebrew

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/button
- https://www.kibo-ui.com/patterns/data-table
- https://www.kibo-ui.com/patterns/badge
- https://www.kibo-ui.com/patterns/empty
