# Development Log

## 2025-11-08 23:52
### [Feature] Added Projects section collapse and add button
**Files Modified:**
- src/components/Sidebar.tsx - Added collapse/expand chevron and hover add button to Projects header

**Implementation Details:**
- **Projects Section Collapse:**
  - Added chevron button (ChevronRight) that rotates based on collapse state
  - Rotates 0deg when collapsed, 90deg when expanded
  - Smooth rotation animation with transition-transform duration-200
  - Click chevron toggles collapse of entire projects section
  - State managed with projectsSectionCollapsed useState
  - Chevron positioned on RIGHT side of "PROJECTS" text

- **Hover Add Button:**
  - Plus (+) icon appears on far right side of "PROJECTS" header when hovering
  - Opens ProjectModal to create new top-level project
  - Opacity-0 default, opacity-60 on group-hover, opacity-100 on button hover
  - Clean, subtle design matching Todoist style

- **Header Layout:**
  - Left side: "PROJECTS" text + rotating chevron (opacity-40)
  - Right side: Plus button (visible on hover only)
  - Group hover effect applied to entire header row

**Related Context:**
- User provided Todoist screenshots showing collapse chevron and hover add button
- Chevron rotates smoothly when toggling collapse state
- Matches Todoist interaction pattern

**Status:** Completed

---

## 2025-11-08 22:30
### [Feature] Dark mode state persists in localStorage
**Files Modified:**
- src/store/taskStore.ts - Added theme and theme color loading from localStorage in initializeStore

**Implementation Details:**
- Theme was already being saved to localStorage on toggle/change
- Added loading of saved theme from localStorage when store initializes
- Loads 'todoist_theme' and 'todoist_theme_color' from localStorage
- Applies saved theme to document.documentElement (adds/removes 'dark' class)
- Applies saved theme color as CSS variable
- If no saved theme exists, defaults to 'light' theme (existing behavior)

**Related Context:**
- User requested dark mode state persistence across page refreshes
- Theme now properly persists and restores on app reload

**Status:** Completed

---

## 2025-11-08 22:33
### [UI] Removed label and filter add buttons from sidebar
**Files Modified:**
- src/components/Sidebar.tsx - Removed "[+ Add Label]" and "[+ Add Filter]" buttons, cleaned up modal imports/state
- src/components/EnhancedTaskForm.tsx - Removed LabelSelector import and all label-related state/logic
- src/App.tsx - Added filter button to header next to view title

**Implementation Details:**
- Removed "[+ Add Label]" and "[+ Add Filter]" buttons from sidebar footer (kept only "[+ Add Project]")
- Removed LabelModal and FilterModal imports and state (isLabelModalOpen, isFilterModalOpen) from Sidebar
- Removed label selection functionality from task form completely
- Cleaned up label state management (selectedLabels, labelIds) from EnhancedTaskForm
- Removed LabelSelector component from "More options" section
- Added filter button in App header with funnel icon
- Filter button placed on right side of header, shows icon only on mobile, icon + "Filter" text on desktop
- Button styled consistently with existing UI (border, hover states, dark mode support)

**Related Context:**
- Simplifying UI by removing label and filter creation buttons
- Filter button in header prepared for future filtering functionality
- Label and filter data still exist in store but no UI to manage them
- Only "[+ Add Project]" button remains in sidebar footer

**Status:** Completed

---

## 2025-11-05 13:10
### [Fix] Date input field now shows human-readable format
**Files Modified:**
- src/hooks/useDateInput.ts - Updated handleDateSelect to use formatDateForDisplay
- src/components/EnhancedTaskForm.tsx - Convert ISO dates to human-readable format when editing tasks

**Implementation Details:**
- When selecting a date from calendar, input now shows "Today", "Tomorrow", "Friday" instead of ISO format "2025-11-05"
- When editing existing task with due date, input field displays human-readable format instead of raw ISO date
- Date is still stored as ISO format in backend (formattedDate property handles conversion)
- Used existing formatDateForDisplay function from naturalLanguage utils

**Related Context:**
- User reported date input showing "2025-11-05" instead of "Today" in Quick Add modal
- This completes the Todoist-style date formatting across both display and input

**Status:** Completed

---

## 2025-11-05 13:05
### [Feature] Updated due date display to match Todoist format
**Files Modified:**
- src/utils/dateFormatter.ts - Updated formatDueDate function and color scheme
- src/components/forms/ProjectSelector.tsx - Removed Apple emoji from Inbox option

**Implementation Details:**
- Changed date display logic to match Todoist exactly:
  - Today → "Today" (green)
  - Tomorrow → "Tomorrow" (orange)
  - This week → Day name only like "Friday", "Monday" (purple)
  - Beyond this week → Date format like "7 Nov", "15 Dec" (purple)
  - Different year → "7 Nov 2026" with year
- Updated color scheme: upcoming dates now use purple/blue instead of gray
- Removed Apple emoji (📥) from Inbox option, using plain text "Inbox" instead

**Related Context:**
- Follows Todoist design principles for date display
- Applied user preference to avoid Apple emojis across the app
- See REFACTORING_SUMMARY.md for overall refactoring context

**Status:** Completed

---

## 2025-11-05 (Earlier)
### [Feature] Created custom PriorityDropdown with Flag icons
**Files Modified:**
- src/components/forms/PriorityDropdown.tsx - New custom dropdown component
- src/components/EnhancedTaskForm.tsx - Updated to use PriorityDropdown in 3-column row layout

**Implementation Details:**
- Used lucide-react Flag icon component (already installed)
- Applied exact Todoist priority colors:
  - P1: #d1453b (red)
  - P2: #eb8909 (orange)
  - P3: #246fe0 (blue)
  - P4: #6c757d (gray)
- Created custom dropdown button (not native select) to properly display colored icons
- Each option shows colored Flag icon + colored text + checkmark for selected item
- Colored dropdown arrow matches selected priority color

**Related Context:**
- Part of task form refactoring to match Todoist design
- Replaced initial attempts using Unicode symbols (⚑) and squares (■)
- User requested third-party icon library to imitate Todoist as closely as possible

**Status:** Completed

---

## 2025-11-05 (Earlier)
### [Refactoring] Complete task form modernization
**Files Modified:**
- src/types/task.ts - Added deprecations, new utility types
- src/store/taskStore.ts - Removed recurrence logic
- src/components/EnhancedTaskForm.tsx - Complete rewrite (471 → 250 lines)

**New Files Created:**
- src/components/forms/TaskFormField.tsx
- src/components/forms/TitleInput.tsx
- src/components/forms/DescriptionInput.tsx
- src/components/forms/DateInput.tsx
- src/components/forms/ProjectSelector.tsx
- src/components/forms/PrioritySelector.tsx
- src/components/forms/LabelSelector.tsx
- src/components/forms/ReminderManager.tsx
- src/hooks/useDateInput.ts
- src/hooks/useReminderInput.ts

**Implementation Details:**
- Removed recurrence functionality completely (as requested)
- Implemented progressive disclosure pattern (3 visible fields + "More options")
- Created 4 always-visible fields: Title, Due Date, Project, Priority
- Added keyboard shortcuts: ⌘+Enter (submit), Escape (cancel), ⌘+M (toggle more options)
- Extracted reusable form components for better maintainability
- Added Inbox option to Project dropdown
- Simplified reminders to preset dropdown only

**Related Context:**
- See REFACTORING_SUMMARY.md for comprehensive documentation
- Follows Todoist design principles: minimal visible fields, fast workflow, smart defaults
- Achieved 47% size reduction while improving functionality

**Status:** Completed
