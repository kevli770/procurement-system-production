# Admin Characters Page Design

## Purpose
Manage organizational characters/positions - view, create, edit, activate/deactivate characters with multi-level manager hierarchy.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Characters Management"                         │
│ Actions: [New Character] button                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Characters Data Table                                   │
│ - Name                                                  │
│ - Level 1 Manager                                       │
│ - Level 2 Manager                                       │
│ - Level 3 Manager                                       │
│ - Level 4 Manager                                       │
│ - Active Status (Badge)                                 │
│ - Updated At                                            │
│ - Actions (Edit, Toggle Active)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Page Header
- **button** - **standard**: "New Character" button with Plus icon

### Main Table
- **data-table** - **advanced**: Characters table
  - Sortable columns (Name, Updated At)
  - Search/filter by name
  - Pagination
  - Row actions (Edit, Toggle)
  - Hierarchical display of manager levels

### Status Badges
- **badge** - **standard**: Active/Inactive status
  - Active: default variant (green)
  - Inactive: outline variant (gray)

### Dialogs
- **dialog** - **form**: Create/Edit character dialog
  - Form fields:
    - Name* (input)
    - Level 1 Manager (combobox, searchable users)
    - Level 2 Manager (combobox, optional)
    - Level 3 Manager (combobox, optional)
    - Level 4 Manager (combobox, optional)
    - Active (checkbox/switch)
  - Manager hierarchy validation
  - Save/Cancel buttons

- **dialog** - **standard**: Confirm deactivate dialog
  - Warning message (if character assigned to users)
  - Confirm/Cancel buttons

### Form Fields
- **input** - **types**: Name field
- **combobox** - **standard**: Manager selection fields (4 levels)
  - Searchable user dropdown
  - Display user name and email
  - Clear option for optional levels
- **switch** - **standard**: Active toggle

### Info Callout
- **callout** - **info**: Explain manager hierarchy
  - "Level 1 manager is required. Additional levels are optional."
  - Display in dialog when creating/editing

### Empty State
- **empty** - **data**: When no characters exist
  - Icon display
  - "No characters defined" message
  - "Create first character" button

## Data Integration Points
- `/api/characters` GET - All characters with manager details
- `/api/characters` POST - Create character
- `/api/characters/[id]` PUT - Update character
- `/api/users?role=MANAGER,ADMIN,SUPER_ADMIN` GET - Manager users list

## Validation Rules
- Name: Required, min 2 characters, unique
- Level 1 Manager: Required
- Level 2-4 Managers: Optional
- Manager hierarchy validation (levels must be sequential)
- Active: Defaults to true

## User Interaction
- Click "New Character" → Open create dialog → Fill form → Submit
- Click Edit → Open edit dialog with pre-filled data → Modify → Save
- Toggle Active → Confirm dialog (if character assigned to users) → Update status
- Search managers in combobox → Filter user list
- Sort/filter table → Re-fetch with params

## Hebrew RTL Support
- All text in Hebrew
- Table reads right-to-left
- Form fields align right
- Dialogs in RTL layout
- Manager hierarchy displays right-to-left

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/button
- https://www.kibo-ui.com/patterns/data-table
- https://www.kibo-ui.com/patterns/badge
- https://www.kibo-ui.com/patterns/dialog
- https://www.kibo-ui.com/patterns/input
- https://www.kibo-ui.com/patterns/combobox
- https://www.kibo-ui.com/patterns/switch
- https://www.kibo-ui.com/patterns/callout
- https://www.kibo-ui.com/patterns/empty
