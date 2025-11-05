# Daily Task Tracker

A modern web-based to-do list application with daily historical tracking and multi-domain organization.

## Features

- **Cloud Sync**: Real-time synchronization across devices with Supabase backend
- **User Authentication**: Secure sign-up and login with email/password
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
  - Subtasks, comments, and reminders
- **Data Persistence**:
  - Cloud database with Supabase (PostgreSQL)
  - Optional offline mode with localStorage fallback
- **Historical View**: Review tasks from previous days
- **Karma System**: Gamification with points, levels, and streaks

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
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

### Database Setup

Before running the app, you need to set up Supabase:

1. Follow the complete guide in `/supabase/SETUP_GUIDE.md`
2. Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ENABLE_OFFLINE_MODE=true
```

See `/supabase/SETUP_GUIDE.md` for detailed instructions.

### Development

```bash
npm run dev
```

The application will open at `http://localhost:5173`

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
│   ├── services/        # Backend service layer
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── projectService.ts
│   │   ├── labelService.ts
│   │   ├── filterService.ts
│   │   ├── karmaService.ts
│   │   └── syncService.ts
│   ├── lib/             # External library configs
│   │   └── supabase.ts
│   ├── store/           # Zustand state management
│   │   └── taskStore.ts
│   ├── types/           # TypeScript type definitions
│   │   ├── task.ts
│   │   └── database.ts
│   ├── utils/           # Utility functions
│   │   ├── dateUtils.ts
│   │   └── storage.ts
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── supabase/            # Database configuration
│   ├── schema.sql       # Database schema
│   └── SETUP_GUIDE.md   # Setup instructions
├── index.html
├── package.json
├── .env.example         # Environment variables template
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Database Architecture

- PostgreSQL database hosted on Supabase
- Row-Level Security (RLS) for data isolation
- Real-time subscriptions for live updates
- Automatic user karma profile creation
- Optimistic updates with offline fallback

## Completed Features

- [x] Backend integration for cloud sync
- [x] User authentication with Supabase Auth
- [x] Real-time synchronization across devices
- [x] Karma/gamification system
- [x] Recurring tasks support
- [x] Dark mode

## Future Enhancements

- [ ] Analytics and productivity insights dashboard
- [ ] Task templates
- [ ] Export/import functionality (CSV, JSON)
- [ ] Mobile app version (React Native)
- [ ] Browser notifications for reminders
- [ ] Calendar view
- [ ] Collaboration features (shared projects)

## License

MIT
