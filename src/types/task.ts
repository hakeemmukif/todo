// ============================================================================
// PROJECTS & ORGANIZATION
// ============================================================================

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string; // Optional, deprecated in UI but kept for backward compatibility
  parentId?: string | null; // Parent project ID for hierarchy
  viewStyle: 'list' | 'board' | 'calendar'; // Project view preference
  isFavorite: boolean;
  isArchived: boolean;
  order: number;
  createdAt: string;
  sections: Section[];
}

export interface Section {
  id: string;
  projectId: string;
  name: string;
  order: number;
  createdAt: string;
}

// ============================================================================
// LABELS
// ============================================================================

export interface Label {
  id: string;
  name: string;
  color: string;
  isFavorite: boolean;
  createdAt: string;
}

// ============================================================================
// REMINDERS
// ============================================================================

export interface Reminder {
  id: string;
  taskId: string;
  type: 'absolute' | 'relative';
  dateTime: string | null;  // absolute time reminder
  relativeMinutes: number | null;  // relative reminder (e.g., 15 minutes before due date)
  isTriggered: boolean;
  createdAt: string;
}

// ============================================================================
// RECURRENCE (DEPRECATED)
// ============================================================================

/**
 * @deprecated Recurrence functionality has been removed. This type is kept for backwards compatibility only.
 */
export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

/**
 * @deprecated Recurrence functionality has been removed. This type is kept for backwards compatibility only.
 */
export interface RecurrencePattern {
  type: RecurrenceType;
  interval: number; // every X days/weeks/months
  daysOfWeek?: number[]; // 0-6 (Sun-Sat) for weekly patterns
  dayOfMonth?: number; // 1-31 for monthly patterns
  monthOfYear?: number; // 1-12 for yearly patterns
  endDate?: string;
  naturalLanguage: string; // "every weekday", "every 2 weeks on friday"
}

// ============================================================================
// TASK PRIORITY & STATUS
// ============================================================================

export enum Priority {
  P1 = 'p1', // Urgent (red)
  P2 = 'p2', // High (orange)
  P3 = 'p3', // Medium (blue)
  P4 = 'p4', // Low (default)
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  REVIEW = 'review',
  DONE = 'done',
}

// ============================================================================
// SUBTASKS & COMMENTS
// ============================================================================

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64 encoded
}

// ============================================================================
// MAIN TASK
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;

  // Organization
  projectId: string | null; // null = Inbox
  sectionId?: string;
  labelIds: string[];

  // Status & Priority
  status: TaskStatus;
  priority: Priority;
  completed: boolean;
  completedAt?: string;

  // Dates
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;

  // Recurrence (DEPRECATED - No longer supported)
  /** @deprecated Recurrence functionality has been removed. This field is ignored. */
  recurrence?: RecurrencePattern;
  /** @deprecated Always false. Recurrence functionality has been removed. */
  isRecurringParent: boolean;
  /** @deprecated Always undefined. Recurrence functionality has been removed. */
  recurringParentId?: string; // for instances of recurring tasks

  // Reminders
  reminders: Reminder[];

  // Hierarchy
  parentTaskId?: string; // for nested subtasks
  subtasks: Subtask[];

  // Additional Info
  comments: Comment[];
  estimatedMinutes?: number;

  // Legacy support (for migration)
  showUntilComplete?: boolean;
  startDate?: string; // multi-day tasks
  endDate?: string;
  timeBlock?: {
    start: string;
    end: string;
  };
  dependency?: {
    blockedBy?: string;
    blockedReason?: string;
    followUpDate?: string;
  };
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * Utility type for task form data - excludes internal/computed fields
 * and deprecated recurrence fields
 */
export type TaskFormData = Omit<
  Task,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'completed'
  | 'completedAt'
  | 'reminders'
  | 'subtasks'
  | 'comments'
  | 'isRecurringParent'
  | 'recurrence'
  | 'recurringParentId'
  | 'showUntilComplete'
  | 'startDate'
  | 'endDate'
  | 'timeBlock'
  | 'dependency'
>;

/**
 * Simplified reminder input for forms
 */
export type ReminderPreset = 'none' | '5min' | '15min' | '30min' | '1hour' | '1day' | 'custom';

// ============================================================================
// FILTERS
// ============================================================================

export interface Filter {
  id: string;
  name: string;
  query: string;
  color: string;
  isFavorite: boolean;
  order: number;
  createdAt: string;
}

// ============================================================================
// PRODUCTIVITY & KARMA
// ============================================================================

export interface KarmaProfile {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  weeklyGoal: number;
  lastCompletionDate?: string;
  pointsHistory: KarmaEvent[];
}

export interface KarmaEvent {
  date: string;
  points: number;
  tasksCompleted: number;
  reason: string; // "completed_task", "daily_goal", "streak_bonus"
}

export interface ProductivityStats {
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  completionsByProject: Record<string, number>;
  completionsByLabel: Record<string, number>;
  completionHeatmap: Record<string, number>; // date -> task count
  mostProductiveDay: string;
  mostProductiveTime: string;
  averageCompletionTime: number; // in minutes
}

// ============================================================================
// VIEW TYPES
// ============================================================================

export enum ViewType {
  INBOX = 'inbox',
  TODAY = 'today',
  UPCOMING = 'upcoming',
  PROJECT = 'project',
  LABEL = 'label',
  FILTER = 'filter',
  COMPLETED = 'completed',
  SEARCH = 'search',
  INSIGHTS = 'insights',
}

export interface ViewState {
  type: ViewType;
  projectId?: string;
  labelId?: string;
  filterId?: string;
  searchQuery?: string;
}

// ============================================================================
// UI LABELS & ICONS
// ============================================================================

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.P1]: 'Priority 1',
  [Priority.P2]: 'Priority 2',
  [Priority.P3]: 'Priority 3',
  [Priority.P4]: 'Priority 4',
};

export const PRIORITY_ICONS: Record<Priority, string> = {
  [Priority.P1]: '[!!]',
  [Priority.P2]: '[!]',
  [Priority.P3]: '[·]',
  [Priority.P4]: '[−]',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.P1]: '#CC0000', // red
  [Priority.P2]: '#FF9800', // orange
  [Priority.P3]: '#4A90E2', // blue
  [Priority.P4]: '#999999', // gray
};

export const STATUS_ICONS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '☐',
  [TaskStatus.IN_PROGRESS]: '◐',
  [TaskStatus.BLOCKED]: '○',
  [TaskStatus.REVIEW]: '⊙',
  [TaskStatus.DONE]: '☑',
};

// Karma point values
export const KARMA_POINTS: Record<Priority, number> = {
  [Priority.P1]: 10,
  [Priority.P2]: 6,
  [Priority.P3]: 4,
  [Priority.P4]: 2,
};

export const KARMA_LEVELS = [
  { level: 1, pointsRequired: 0, title: 'Beginner' },
  { level: 2, pointsRequired: 50, title: 'Novice' },
  { level: 3, pointsRequired: 150, title: 'Intermediate' },
  { level: 4, pointsRequired: 300, title: 'Advanced' },
  { level: 5, pointsRequired: 500, title: 'Expert' },
  { level: 6, pointsRequired: 800, title: 'Master' },
  { level: 7, pointsRequired: 1200, title: 'Grand Master' },
  { level: 8, pointsRequired: 1800, title: 'Legend' },
  { level: 9, pointsRequired: 2600, title: 'Enlightened' },
  { level: 10, pointsRequired: 3600, title: 'Productivity God' },
];

// Default colors for projects and labels
export const DEFAULT_COLORS = [
  '#CC0000', // red
  '#FF9800', // orange
  '#FFC107', // amber
  '#4CAF50', // green
  '#00BCD4', // cyan
  '#2196F3', // blue
  '#673AB7', // deep purple
  '#9C27B0', // purple
  '#E91E63', // pink
  '#795548', // brown
  '#607D8B', // blue gray
  '#999999', // gray
];

// Default project icons
export const PROJECT_ICONS = [
  '📁', '💼', '🏠', '🎯', '📚', '💻', '🎨', '✈️',
  '🏋️', '🛒', '💡', '🔧', '📊', '🎵', '🎮', '📱'
];
