# Shared Navigation & Layout Components

## Purpose
Define shared components used across all pages: navigation menu, page header, breadcrumbs, user menu.

## Required Components (Level 1 - Level 2)

### Main Navigation
- **navigation-menu** - **sidebar**: Main application navigation
  - Collapsible sidebar
  - Role-based menu items
  - Active state indication
  - Icons + labels
  - Menu items:
    - Dashboard (all users)
    - Purchase Orders (all users)
    - Approvals (MANAGER+)
    - Admin section (ADMIN+):
      - Users
      - Items
      - Suppliers
      - Companies
      - Characters

### User Menu
- **dropdown-menu** - **standard**: User account menu
  - Avatar/initial display
  - User name and role
  - Menu items:
    - Profile/Settings
    - Logout

### Page Header
- **breadcrumb** - **standard**: Page navigation breadcrumbs
  - Show current path
  - Clickable ancestors
  - RTL support

### Layout Container
- **layout** - **dashboard**: Main dashboard layout
  - Responsive sidebar
  - Main content area
  - Mobile menu toggle
  - RTL layout support

### Notifications
- **toast** - **standard**: Success/error notifications
  - Auto-dismiss
  - Close button
  - Position: top-right (RTL: top-left)
  - Variants: success, error, warning, info

### Loading States
- **skeleton** - **standard**: Loading placeholders
  - Table skeleton
  - Card skeleton
  - Form skeleton

- **spinner** - **standard**: Loading spinner
  - Button loading states
  - Page loading overlay

## Data Integration Points
- Current user context
- Active route detection
- Permission-based menu rendering

## User Interaction
- Click navigation item → Navigate to page
- Click user menu → Show dropdown
- Click logout → Sign out
- Mobile: Toggle sidebar visibility
- Breadcrumbs: Navigate back through hierarchy

## Hebrew RTL Support
- Navigation menu text in Hebrew
- Right-to-left menu layout
- Icons on correct side (left in RTL)
- Breadcrumbs separator direction reversed

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/navigation-menu
- https://www.kibo-ui.com/patterns/dropdown-menu
- https://www.kibo-ui.com/patterns/breadcrumb
- https://www.kibo-ui.com/patterns/layout
- https://www.kibo-ui.com/patterns/toast
- https://www.kibo-ui.com/patterns/skeleton
- https://www.kibo-ui.com/patterns/spinner
