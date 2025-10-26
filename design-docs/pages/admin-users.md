# Admin Users Page Design

## Purpose
Manage system users - view, create, edit, activate/deactivate users.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Users Management"                              │
│ Actions: [New User] button                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Users Data Table                                        │
│ - Name                                                  │
│ - Email                                                 │
│ - Role (Badge)                                          │
│ - Character                                             │
│ - Active Status (Switch/Badge)                          │
│ - Created At                                            │
│ - Actions (Edit, Toggle Active)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Page Header
- **button** - **standard**: "New User" button with Plus icon

### Main Table
- **data-table** - **advanced**: Users table
  - Sortable columns
  - Search/filter by name, email, role
  - Pagination
  - Row actions (Edit, Toggle)

### Role Badges
- **badge** - **standard**: Role indicators
  - USER: outline variant
  - MANAGER: default variant (blue)
  - ADMIN: default variant (purple)
  - SUPER_ADMIN: default variant (red/gold)

### Status Indicators
- **badge** - **standard**: Active/Inactive status
  - Active: default variant (green)
  - Inactive: outline variant (gray)

### Dialogs
- **dialog** - **form**: Create/Edit user dialog
  - Form fields:
    - Name* (input)
    - Email* (input, email type)
    - Password* (input, password type - create only)
    - Role* (select/combobox)
    - Character (select/combobox, optional)
    - Active (checkbox/switch)
  - Validation for required fields
  - Save/Cancel buttons

- **dialog** - **standard**: Confirm deactivate dialog
  - Warning message
  - Confirm/Cancel buttons

### Form Fields
- **input** - **types**: Name, Email, Password fields
- **select** - **standard**: Role selection dropdown
- **combobox** - **standard**: Character selection (searchable)
- **switch** - **standard**: Active toggle

### Empty State
- **empty** - **data**: When no users exist
  - Icon display
  - "No users yet" message
  - "Create first user" button

## Data Integration Points
- `/api/users` GET - All users
- `/api/users` POST - Create user
- `/api/users/[id]` PUT - Update user
- `/api/characters` GET - Characters list for dropdown

## Validation Rules
- Name: Required, min 2 characters
- Email: Required, valid email format, unique
- Password: Required on create, min 8 characters
- Role: Required
- Character: Optional

## User Interaction
- Click "New User" → Open create dialog → Fill form → Submit
- Click Edit → Open edit dialog with pre-filled data → Modify → Save
- Toggle Active → Confirm dialog → Update status
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
- https://www.kibo-ui.com/patterns/select
- https://www.kibo-ui.com/patterns/combobox
- https://www.kibo-ui.com/patterns/switch
- https://www.kibo-ui.com/patterns/empty
