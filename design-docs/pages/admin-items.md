# Admin Items Page Design

## Purpose
Manage catalogue items - view, create, edit, activate/deactivate items.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Items Catalogue"                               │
│ Actions: [New Item] button                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Items Data Table                                        │
│ - SKU                                                   │
│ - Name                                                  │
│ - Description                                           │
│ - Unit Price                                            │
│ - Active Status (Badge)                                 │
│ - Updated At                                            │
│ - Actions (Edit, Toggle Active)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Page Header
- **button** - **standard**: "New Item" button with Plus icon

### Main Table
- **data-table** - **advanced**: Items table
  - Sortable columns (SKU, Name, Price, Updated At)
  - Search/filter by SKU, Name
  - Pagination
  - Row actions (Edit, Toggle)
  - Currency formatting for prices (₪)

### Status Badges
- **badge** - **standard**: Active/Inactive status
  - Active: default variant (green)
  - Inactive: outline variant (gray)

### Dialogs
- **dialog** - **form**: Create/Edit item dialog
  - Form fields:
    - Name* (input)
    - SKU (input, auto-generated if empty)
    - Description (textarea)
    - Unit Price* (input, number type)
    - Active (checkbox/switch)
  - Validation for required fields
  - Save/Cancel buttons

- **dialog** - **standard**: Confirm deactivate dialog
  - Warning message (if item is used in POs)
  - Confirm/Cancel buttons

### Form Fields
- **input** - **types**: Name, SKU, Unit Price fields
  - Unit Price with currency symbol (₪)
  - Number validation for price (min 0.01)
- **textarea** - **standard**: Description field
- **switch** - **standard**: Active toggle

### Empty State
- **empty** - **data**: When no items exist
  - Icon display
  - "No items in catalogue" message
  - "Add first item" button

## Data Integration Points
- `/api/items` GET - All items
- `/api/items` POST - Create item
- `/api/items/[id]` PUT - Update item

## Validation Rules
- Name: Required, min 2 characters
- SKU: Optional, auto-generated if not provided, must be unique
- Description: Optional
- Unit Price: Required, must be > 0
- Active: Defaults to true

## User Interaction
- Click "New Item" → Open create dialog → Fill form → Submit
- Click Edit → Open edit dialog with pre-filled data → Modify → Save
- Toggle Active → Confirm dialog (especially if item used in POs) → Update status
- Sort/filter table → Re-fetch with params

## Hebrew RTL Support
- All text in Hebrew
- Table reads right-to-left
- Form fields align right
- Dialogs in RTL layout
- Currency symbol (₪) placement

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/button
- https://www.kibo-ui.com/patterns/data-table
- https://www.kibo-ui.com/patterns/badge
- https://www.kibo-ui.com/patterns/dialog
- https://www.kibo-ui.com/patterns/input
- https://www.kibo-ui.com/patterns/textarea
- https://www.kibo-ui.com/patterns/switch
- https://www.kibo-ui.com/patterns/empty
