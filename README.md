# Daily Task Tracker

A modern web-based to-do list application with daily historical tracking and multi-domain organization.

## Features

- **Daily Task Tracking**: Navigate through your tasks by day of year (Day 1, Day 2, ... Day 365)
- **Multi-Domain Organization**: Organize tasks across different categories:
  - Full-Time Job (daily tracking)
  - Part-Time/Freelance (session-based tracking)
  - Skill Development
  - Shopping Lists
  - Projects
  - Personal Tasks
- **Dual Tracking Modes**:
  - Daily tracking for regular tasks
  - Session-based tracking for freelance/project work
- **Task Management**:
  - Create, edit, and delete tasks
  - Mark tasks as complete
  - Add due dates with visual indicators
  - Filter tasks by category
- **Data Persistence**: All tasks are saved to browser localStorage
- **Historical View**: Review tasks from previous days

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns
- **Testing**: Vitest + React Testing Library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm test
```

## Usage

1. **Navigate Days**: Use the Previous/Next Day buttons to move through your task history
2. **Add Tasks**: Click "Add New Task" to create a new task
3. **Filter by Category**: Use the category tabs to filter tasks
4. **Complete Tasks**: Click the checkbox next to a task to mark it as complete
5. **Track Progress**: View your daily completion rate in the progress bar

## Project Structure

```
to-do-list/
├── src/
│   ├── components/       # React components
│   │   ├── DailyNavigation.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   └── CategoryTabs.tsx
│   ├── store/           # Zustand state management
│   │   └── taskStore.ts
│   ├── types/           # TypeScript type definitions
│   │   └── task.ts
│   ├── utils/           # Utility functions
│   │   ├── dateUtils.ts
│   │   └── storage.ts
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Future Enhancements

- [ ] Backend integration for cloud sync
- [ ] Analytics and productivity insights
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Export/import functionality
- [ ] Dark mode
- [ ] Mobile app version

## License

MIT
