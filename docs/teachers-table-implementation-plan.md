# Enhanced Data Table with Pagination, Sorting, and Faceted Filtering

## Overview

This plan enhances the existing Teachers table with advanced features including pagination, sorting, global search, and **faceted column filters** for department and location (city) using TanStack Table and shadcn UI components.

## Current State

The current implementation includes:

- Basic TanStack Table setup in `data-table.tsx` with only `getCoreRowModel`
- Simple column definitions in `column.tsx` for Teacher data
- Teacher type with fields: id, email, first_name, last_name, department, phone, school_id, created_at, updated_at
- Database schema includes `subject_specialization` field on teachers and `city` field on schools table
- Existing shadcn UI components: Table, Input, Button, Dropdown Menu

## User Requirements

> [!IMPORTANT]
> User requested faceted filters (like Example #4 from shadcnstudio.com) for:
>
> - **Department/Subject Specialization** - Filter by specific departments or subjects (e.g., "Science", "Physical Education", "Arts")
> - **Location/City** - Filter by school city (e.g., "London", "Manchester", "Edinburgh")
> - **Responsive Design** - Let Tailwind CSS handle all responsiveness automatically

## Proposed Changes

### Backend/Data Layer

#### [MODIFY] [use-teachers.tsx](file:///c:/Users/Admin/Documents/GitHub/ClubConnectUK/src/hooks/use-teachers.tsx)

**Changes:**

1. Update the Supabase query to join with `schools` table to get city information
2. Return enhanced teacher data including school city and name
3. Keep the query optimized with select only needed fields

**Updated query:**

```typescript
const { data, error } = await supabase.from('teachers').select(`
    *,
    schools:school_id (
      name,
      city
    )
  `)
```

#### [MODIFY] [teacher.types.ts](file:///c:/Users/Admin/Documents/GitHub/ClubConnectUK/src/types/teacher.types.ts)

**Changes:**

1. Add nested school data to the Teacher interface
2. Support for joined data structure

---

### Component: Teachers Table

#### [MODIFY] [data-table.tsx](file:///c:/Users/Admin/Documents/GitHub/ClubConnectUK/src/routes/_protected/teachers/data-table.tsx)

**Changes:**

1. Add state management for sorting, filtering, and pagination using React `useState`
2. Import and configure additional TanStack Table features:
   - `getPaginationRowModel` - for pagination
   - `getSortedRowModel` - for column sorting
   - `getFilteredRowModel` - for global and column filtering
   - `getFacetedRowModel` - for faceted filter support
   - `getFacetedUniqueValues` - to get unique values for filter dropdowns
   - State handlers: `onSortingChange`, `onColumnFiltersChange`, `onPaginationChange`
3. Add `DataTableToolbar` component above the table
4. Add `DataTablePagination` component below the table
5. Use Tailwind responsive classes for layout (e.g., `md:flex`, `overflow-x-auto`)

#### [MODIFY] [column.tsx](file:///c:/Users/Admin/Documents/GitHub/ClubConnectUK/src/routes/_protected/teachers/column.tsx)

**Changes:**

1. Make column headers sortable with sort indicators using shadcn Button component
2. Improve cell formatting:
   - Combine `first_name` and `last_name` into single "Name" column
   - Format email with `mailto:` link styling
   - Display department clearly
   - Display school city from joined data
   - Hide internal fields (id, school_id, created_at, updated_at)
3. Add `filterFn` for columns that support faceted filtering

**New column structure:**

- **Name** (first_name + last_name) - sortable
- **Email** - sortable, mailto link
- **Department** - sortable, faceted filterable
- **Subject** (subject_specialization) - sortable
- **City** - sortable, faceted filterable
- **Phone** - display only

#### [NEW] [data-table-toolbar.tsx](file:///c:/Users/Admin/Documents/GitHub/ClubConnectUK/src/routes/_protected/teachers/data-table-toolbar.tsx)

**Purpose:** Toolbar with global search and faceted filters

**Features:**

1. **Global search input** - Search across all columns with magnifying glass icon
2. **Department faceted filter** - Multi-select dropdown showing all unique departments with count badges
3. **City faceted filter** - Multi-select dropdown showing all unique cities with count badges
4. **Clear filters button** - Reset all active filters (only shown when filters are applied)
5. **Responsive layout** - Stack vertically on mobile using Tailwind `flex-col md:flex-row`

**Implementation:**

- Use `table.getColumn('department').getFacetedUniqueValues()` to get unique departments
- Use shadcn `DropdownMenu` with checkboxes for multi-select
- Show active filter count as badges
- Real-time filtering as user selects options

#### [NEW] [data-table-pagination.tsx](file:///c:/Users/Admin/Documents/GitHub/ClubConnectUK/src/routes/_protected/teachers/data-table-pagination.tsx)

**Purpose:** Reusable pagination controls

**Features:**

- Page info (e.g., "Showing 1-10 of 45 teachers")
- Previous/Next buttons with disabled states
- Page size selector dropdown (10, 20, 50, 100 rows per page)
- Responsive layout using Tailwind `flex-col sm:flex-row`

#### [NEW] [data-table-faceted-filter.tsx](file:///c:/Users/Admin/Documents/GitHub/ClubConnectUK/src/routes/_protected/teachers/data-table-faceted-filter.tsx)

**Purpose:** Reusable faceted filter component (like shadcnstudio example)

**Features:**

- Generic multi-select dropdown for any column
- Display options with checkboxes
- Show selected count as badge
- Option to clear individual filter
- Uses shadcn components: Button, Popover, Command, Badge

---

## Verification Plan

### Automated Tests

No existing automated tests were found for the teachers table. For this enhancement, we will rely on manual verification in the browser.

### Manual Verification

> [!IMPORTANT]
> All manual testing should be performed in the browser with the development server running.

**Prerequisites:**

1. Start the development server: `npm run dev`
2. Navigate to the Teachers page at `http://localhost:3000/teachers/teacher-list`
3. Ensure the database has teachers from multiple departments and cities (seed data provides this)

**Test Cases:**

1. **Pagination Testing**
   - Verify page size selector shows options (10, 20, 50, 100)
   - Change page size and verify correct number of rows display
   - Navigate between pages using Previous/Next buttons
   - Verify pagination info displays correctly

2. **Sorting Testing**
   - Click column headers to sort ascending/descending
   - Test sorting on: Name, Email, Department, City
   - Verify sort arrow indicators display correctly

3. **Global Search Testing**
   - Type in global search input
   - Verify real-time filtering across all columns
   - Clear search and verify all results return

4. **Faceted Filter Testing - Department**
   - Open Department filter dropdown
   - Verify all unique departments are listed (Science, Arts, Physical Education, Music, etc.)
   - Select multiple departments (e.g., "Science" + "Arts")
   - Verify only teachers from selected departments show
   - Verify filter badge shows count of selected filters
   - Clear the filter and verify full results return

5. **Faceted Filter Testing - City**
   - Open City filter dropdown
   - Verify all unique cities are listed (London, Manchester, Edinburgh, Birmingham, Leeds)
   - Select one city (e.g., "London")
   - Verify only teachers from London schools show
   - Select multiple cities
   - Verify combined filter works correctly

6. **Combined Filters Testing**
   - Apply department filter (e.g., "Science")
   - Then apply city filter (e.g., "London")
   - Verify both filters work together (AND logic)
   - Add global search on top
   - Verify all three filter types work simultaneously
   - Use "Clear filters" button and verify all filters reset

7. **Responsive Design Testing**
   - Resize browser to mobile width (<640px)
   - Verify toolbar stacks vertically
   - Verify filters remain accessible and usable
   - Verify table has horizontal scroll if needed
   - Verify pagination controls are responsive
   - Test on tablet width (768px) and desktop (1024px+)

> [!NOTE]
> Tailwind CSS will handle responsive design automatically through utility classes. No custom media queries needed.
