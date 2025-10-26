# Purchase Order Create Page Design

## Purpose
Create new purchase order with supplier/company selection and line items management.

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: "New Purchase Order"                            │
│ Actions: [Cancel] [Save Draft] [Submit for Approval]   │
├─────────────────────────────────────────────────────────┤
│ Order Details Card                                      │
│ - Supplier (Combobox)                                  │
│ - Company (Combobox)                                   │
│ - Remarks (Textarea)                                   │
├─────────────────────────────────────────────────────────┤
│ Line Items Card                                         │
│ Actions: [Add from Catalogue] [Add Custom Item]        │
│                                                          │
│ Items Table:                                            │
│ - SKU, Name, Description, Unit Price, Quantity, Total  │
│ - Remove button per row                                │
│ - Editable quantity inline                             │
│ - Grand Total row                                      │
└─────────────────────────────────────────────────────────┘
```

## Required Components (Level 1 - Level 2)

### Action Buttons
- **button** - **outline**: Cancel, Save Draft
- **button** - **standard**: Submit for Approval (primary)
- **button** - **destructive**: Delete item

### Form Fields
- **combobox** - **standard**: Supplier and Company selection
  - Searchable dropdown
  - Display name
  - Required field validation

- **textarea** - **standard**: Remarks field
  - Multi-line input
  - Optional field

### Line Items Table
- **data-table** - **standard**: Line items display
  - Inline quantity editing
  - Dynamic total calculation
  - Remove row action

- **input** - **types**: Quantity input (number type)
  - Min value validation
  - Numeric keyboard on mobile

### Dialogs
- **dialog** - **standard**: Add item from catalogue
  - Combobox for item selection
  - Quantity input
  - Add/Cancel buttons

- **dialog** - **standard**: Add custom item
  - Form fields: Name*, SKU, Description, Unit Price*, Quantity
  - Validation for required fields
  - Add/Cancel buttons

### Cards
- **card** - **standard**: Section containers
  - Order Details card
  - Line Items card

## Data Integration Points
- `/api/suppliers` - Supplier list
- `/api/companies` - Company list
- `/api/items` - Items catalogue
- `/api/purchase-orders` POST - Create PO
- `/api/purchase-orders/[id]` PUT - Submit for approval

## Validation Rules
- Supplier: Required
- Company: Required
- At least 1 line item: Required
- Custom item name: Required
- Custom item unit price: Required, > 0

## User Interaction
- Select supplier/company → Populate dropdowns
- Add from Catalogue → Open dialog, select item, add to table
- Add Custom Item → Open dialog, fill form, add to table
- Edit quantity → Recalculate line total and grand total
- Remove item → Delete from table, recalculate grand total
- Save Draft → Create PO with DRAFT status
- Submit for Approval → Create PO, then update to PENDING_APPROVAL

## Hebrew RTL Support
- All labels in Hebrew
- Form fields align right
- Dialogs in RTL layout

---

**Pattern Selection Needed:**
User will choose Level 3 pattern numbers from:
- https://www.kibo-ui.com/patterns/button
- https://www.kibo-ui.com/patterns/combobox
- https://www.kibo-ui.com/patterns/textarea
- https://www.kibo-ui.com/patterns/data-table
- https://www.kibo-ui.com/patterns/input
- https://www.kibo-ui.com/patterns/dialog
- https://www.kibo-ui.com/patterns/card
