# Selected Patterns for Procurement System

## Design Philosophy
Professional, consistent, accessible business application with Hebrew RTL support.

## Pattern Selections

### Buttons
- **Primary Actions** (New Order, Submit, Save, Approve): `pattern-button-standard-2` (with left icon)
- **Secondary Actions** (Cancel, Back): `pattern-button-outline-1` (basic outline)
- **Destructive Actions** (Delete, Reject): `pattern-button-destructive-1` (standard destructive)
- **Loading States**: `pattern-button-standard-5` (with spinner)

### Data Tables
- **Standard Tables** (Dashboard, Admin pages): `pattern-data-table-standard-1`
- **Advanced Tables** (PO List, Approvals): `pattern-data-table-advanced-1`

### Cards
- **Dashboard Stats Cards**: `pattern-card-standard-1`
- **Section Containers**: `pattern-card-standard-1`

### Badges
- **Status Indicators**: `pattern-badge-standard-1`

### Forms
- **Text Input**: `pattern-input-standard-1`
- **Number Input**: `pattern-input-types-1`
- **Email Input**: `pattern-input-types-1`
- **Textarea**: `pattern-textarea-standard-1`
- **Combobox** (Searchable dropdowns): `pattern-combobox-standard-1`
- **Select** (Simple dropdowns): `pattern-select-standard-1`
- **Switch** (Active/Inactive): `pattern-switch-standard-1`

### Dialogs
- **Form Dialogs** (Create/Edit): `pattern-dialog-form-1`
- **Confirmation Dialogs**: `pattern-dialog-standard-1`
- **Alert Dialogs** (Destructive actions): `pattern-alert-dialog-destructive-1`

### Navigation
- **Sidebar Navigation**: `pattern-navigation-menu-sidebar-1`
- **User Dropdown**: `pattern-dropdown-menu-standard-1`
- **Breadcrumbs**: `pattern-breadcrumb-standard-1`

### Layout
- **Dashboard Layout**: `pattern-layout-dashboard-1`

### Feedback
- **Toast Notifications**: `pattern-toast-standard-1`
- **Empty States**: `pattern-empty-data-1`
- **Callout/Info**: `pattern-callout-info-1`

### Loading
- **Skeleton Loaders**: `pattern-skeleton-standard-1`
- **Spinner**: `pattern-spinner-standard-1`

### Misc
- **Timeline** (Approval history): `pattern-timeline-standard-1`
- **Separator**: `pattern-separator-standard-1`

## Rationale

1. **Consistency**: All standard buttons use pattern-2 (with icon support) for uniform look
2. **Clarity**: Outline buttons for secondary actions, destructive variant for dangerous actions
3. **Professional**: Clean, modern patterns suitable for business applications
4. **Accessibility**: Standard patterns ensure good accessibility defaults
5. **RTL Support**: All selected patterns from my-patterns registry support RTL by default
6. **Scalability**: Standard patterns are well-tested and maintainable
