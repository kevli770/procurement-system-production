# Admin Suppliers Page Design

## Purpose
Manage suppliers - view, create, edit, activate/deactivate suppliers.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Suppliers Management"                          │
│ Actions: [New Supplier] button                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Suppliers Data Table                                    │
│ - Name                                                  │
│ - Email                                                 │
│ - Phone                                                 │
│ - Address                                               │
│ - Active Status (Badge)                                 │
│ - Updated At                                            │
│ - Actions (Edit, Toggle Active)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Page Header
- **button** - **standard**: "New Supplier" button with Plus icon

### Main Table
- **data-table** - **advanced**: Suppliers table
  - Sortable columns (Name, Updated At)
  - Search/filter by name, email
  - Pagination
  - Row actions (Edit, Toggle)

### Status Badges
- **badge** - **standard**: Active/Inactive status
  - Active: default variant (green)
  - Inactive: outline variant (gray)

### Dialogs
- **dialog** - **form**: Create/Edit supplier dialog
  - Form fields:
    - Name* (input)
    - Email (input, email type)
    - Phone (input, tel type)
    - Address (textarea)
    - Active (checkbox/switch)
  - Validation for required fields
  - Save/Cancel buttons

- **dialog** - **standard**: Confirm deactivate dialog
  - Warning message (if supplier has POs)
  - Confirm/Cancel buttons

### Form Fields
- **input** - **types**: Name, Email, Phone fields
  - Email validation
  - Phone formatting
- **textarea** - **standard**: Address field
- **switch** - **standard**: Active toggle

### Empty State
- **empty** - **data**: When no suppliers exist
  - Icon display
  - "No suppliers yet" message
  - "Add first supplier" button

## Data Integration Points
- `/api/suppliers` GET - All suppliers
- `/api/suppliers` POST - Create supplier
- `/api/suppliers/[id]` PUT - Update supplier

## Validation Rules
- Name: Required, min 2 characters, unique
- Email: Optional, must be valid email format if provided
- Phone: Optional
- Address: Optional
- Active: Defaults to true

## User Interaction
- Click "New Supplier" → Open create dialog → Fill form → Submit
- Click Edit → Open edit dialog with pre-filled data → Modify → Save
- Toggle Active → Confirm dialog (especially if supplier has POs) → Update status
- Sort/filter table → Re-fetch with params

## Hebrew RTL Support
- All text in Hebrew
- Table reads right-to-left
- Form fields align right
- Dialogs in RTL layout
- Address textarea in RTL

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
