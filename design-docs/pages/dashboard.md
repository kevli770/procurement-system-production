# Dashboard Page Design

## Purpose
Main dashboard displaying procurement system statistics, recent orders, and top suppliers.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Dashboard Header                                         │
├─────────────────────────────────────────────────────────┤
│ [Stats Card] [Stats Card] [Stats Card] [Stats Card]    │
├──────────────────────────┬──────────────────────────────┤
│ Recent Orders Table      │ Top Suppliers Widget         │
│                          │                               │
└──────────────────────────┴──────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Stats Cards (4 cards)
- **card** - **standard**: Display total POs, pending approvals, monthly spending, total spending
  - Each card needs title, large number, and sub-text
  - Icon integration (ShoppingCart, CheckSquare, TrendingUp)
  - Click-through link for pending approvals

### Recent Orders Section
- **data-table** - **standard**: Show recent 5 purchase orders
  - Columns: PO Number, Date, Supplier, Company, Amount, Status, Actions
  - Status badges integration
  - View button for each row
  - "View All Orders" link button

### Top Suppliers Section
- **card** - **standard**: Container for supplier rankings
  - List of supplier items with:
    - Ranking number badge
    - Supplier name
    - Order count
    - Total spending
    - Alert indicator for >100K

## Data Integration Points
- `/api/dashboard/stats` - Statistics data
- `/api/purchase-orders?limit=5` - Recent orders
- `/api/dashboard/top-suppliers` - Top 10 suppliers

## User Interaction
- Click stats card → Navigate to relevant section
- Click "View All Orders" → Navigate to /purchase-orders
- Click View button → Navigate to /purchase-orders/[id]
- Click pending approvals link → Navigate to /approvals

## Hebrew RTL Support
- All text labels in Hebrew
- Right-to-left layout
- Number formatting with ₪ symbol

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/card
- https://www.kibo-ui.com/patterns/data-table
