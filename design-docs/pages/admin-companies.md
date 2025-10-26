# Admin Companies Page Design

## Purpose
Manage companies - view, create, edit, activate/deactivate companies.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Companies Management"                          │
│ Actions: [New Company] button                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Companies Data Table                                    │
│ - Name                                                  │
│ - Active Status (Badge)                                 │
│ - Updated At                                            │
│ - Actions (Edit, Toggle Active)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Page Header
- **button** - **standard**: "New Company" button with Plus icon

### Main Table
- **data-table** - **standard**: Companies table (simpler than other admin tables)
  - Sortable columns (Name, Updated At)
  - Search/filter by name
  - Pagination
  - Row actions (Edit, Toggle)

### Status Badges
- **badge** - **standard**: Active/Inactive status
  - Active: default variant (green)
  - Inactive: outline variant (gray)

### Dialogs
- **dialog** - **form**: Create/Edit company dialog (simple)
  - Form fields:
    - Name* (input)
    - Active (checkbox/switch)
  - Validation for required fields
  - Save/Cancel buttons

- **dialog** - **standard**: Confirm deactivate dialog
  - Warning message (if company has POs)
  - Confirm/Cancel buttons

### Form Fields
- **input** - **types**: Name field
- **switch** - **standard**: Active toggle

### Empty State
- **empty** - **data**: When no companies exist
  - Icon display
  - "No companies yet" message
  - "Add first company" button

## Data Integration Points
- `/api/companies` GET - All companies
- `/api/companies` POST - Create company
- `/api/companies/[id]` PUT - Update company

## Validation Rules
- Name: Required, min 2 characters, unique
- Active: Defaults to true

## User Interaction
- Click "New Company" → Open create dialog → Fill form → Submit
- Click Edit → Open edit dialog with pre-filled data → Modify → Save
- Toggle Active → Confirm dialog (especially if company has POs) → Update status
- Sort/filter table → Re-fetch with params

## Hebrew RTL Support
- All text in Hebrew
- Table reads right-to-left
- Form fields align right
- Dialogs in RTL layout

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/button
- https://www.kibo-ui.com/patterns/data-table
- https://www.kibo-ui.com/patterns/badge
- https://www.kibo-ui.com/patterns/dialog
- https://www.kibo-ui.com/patterns/input
- https://www.kibo-ui.com/patterns/switch
- https://www.kibo-ui.com/patterns/empty
