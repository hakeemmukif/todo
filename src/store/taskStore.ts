import { create } from 'zustand';
import {
  Task,
  Project,
  Section,
  Label,
  Filter,
  Reminder,
  KarmaProfile,
  ProductivityStats,
  ViewState,
  ViewType,
  TaskStatus,
  Subtask,
  Comment,
  KARMA_POINTS,
  KARMA_LEVELS,
  KarmaEvent,
} from '../types/task';
import { formatDate, parseDate, isToday, startOfDay, addDays } from '../utils/dateUtils';
import { getNextOccurrence } from '../utils/naturalLanguage';

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

const STORAGE_KEYS = {
  TASKS: 'todoist_tasks',
  PROJECTS: 'todoist_projects',
  LABELS: 'todoist_labels',
  FILTERS: 'todoist_filters',
  KARMA: 'todoist_karma',
  VIEW_STATE: 'todoist_view_state',
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface TaskStore {
  // Data
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  filters: Filter[];
  karma: KarmaProfile;
  viewState: ViewState;

  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'sections'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (projectIds: string[]) => void;
  getProjectById: (id: string) => Project | undefined;

  // Sections
  addSection: (projectId: string, name: string) => void;
  updateSection: (projectId: string, sectionId: string, name: string) => void;
  deleteSection: (projectId: string, sectionId: string) => void;

  // Labels
  addLabel: (label: Omit<Label, 'id' | 'createdAt'>) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
  getLabelById: (id: string) => Label | undefined;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'reminders' | 'subtasks' | 'comments' | 'isRecurringParent' | 'labelIds'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  moveTask: (id: string, projectId: string, sectionId?: string) => void;
  duplicateTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;

  // Subtasks
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Comments
  addComment: (taskId: string, content: string) => void;
  deleteComment: (taskId: string, commentId: string) => void;

  // Filters
  addFilter: (filter: Omit<Filter, 'id' | 'createdAt'>) => void;
  updateFilter: (id: string, updates: Partial<Filter>) => void;
  deleteFilter: (id: string) => void;

  // Reminders
  addReminder: (taskId: string, reminder: Omit<Reminder, 'id' | 'taskId' | 'createdAt'>) => void;
  deleteReminder: (taskId: string, reminderId: string) => void;

  // View State
  setViewState: (viewState: ViewState) => void;
  goToInbox: () => void;
  goToToday: () => void;
  goToUpcoming: () => void;
  goToProject: (projectId: string) => void;
  goToLabel: (labelId: string) => void;
  goToFilter: (filterId: string) => void;
  goToInsights: () => void;

  // Queries
  getTasksForCurrentView: () => Task[];
  getTasksForToday: () => Task[];
  getTasksForUpcoming: () => Task[];
  getOverdueTasks: () => Task[];
  getTasksByProject: (projectId: string, sectionId?: string) => Task[];
  getTasksByLabel: (labelId: string) => Task[];
  getTasksByFilter: (query: string) => Task[];
  searchTasks: (query: string) => Task[];

  // Karma & Productivity
  updateKarmaOnTaskCompletion: (task: Task) => void;
  getProductivityStats: () => ProductivityStats;
  checkDailyGoal: () => boolean;
  checkWeeklyGoal: () => boolean;

  // Initialization
  loadFromStorage: () => void;
  migrateOldData: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  projects: [],
  labels: [],
  filters: [],
  karma: {
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    dailyGoal: 5,
    weeklyGoal: 30,
    pointsHistory: [],
  },
  viewState: {
    type: ViewType.TODAY,
  },

  // ========================================================================
  // PROJECTS
  // ========================================================================

  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: formatDate(new Date()),
      sections: [],
    };

    set((state) => {
      const updatedProjects = [...state.projects, newProject];
      saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
      return { projects: updatedProjects };
    });
  },

  updateProject: (id, updates) => {
    set((state) => {
      const updatedProjects = state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
      return { projects: updatedProjects };
    });
  },

  deleteProject: (id) => {
    set((state) => {
      const updatedProjects = state.projects.filter((p) => p.id !== id);
      const updatedTasks = state.tasks.filter((t) => t.projectId !== id);
      saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { projects: updatedProjects, tasks: updatedTasks };
    });
  },

  reorderProjects: (projectIds) => {
    set((state) => {
      const projectMap = new Map(state.projects.map((p) => [p.id, p]));
      const updatedProjects = projectIds
        .map((id, index) => {
          const project = projectMap.get(id);
          return project ? { ...project, order: index } : null;
        })
        .filter((p): p is Project => p !== null);

      saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
      return { projects: updatedProjects };
    });
  },

  getProjectById: (id) => {
    return get().projects.find((p) => p.id === id);
  },

  // ========================================================================
  // SECTIONS
  // ========================================================================

  addSection: (projectId, name) => {
    set((state) => {
      const updatedProjects = state.projects.map((p) => {
        if (p.id === projectId) {
          const newSection: Section = {
            id: crypto.randomUUID(),
            projectId,
            name,
            order: p.sections.length,
            createdAt: formatDate(new Date()),
          };
          return { ...p, sections: [...p.sections, newSection] };
        }
        return p;
      });
      saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
      return { projects: updatedProjects };
    });
  },

  updateSection: (projectId, sectionId, name) => {
    set((state) => {
      const updatedProjects = state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            sections: p.sections.map((s) =>
              s.id === sectionId ? { ...s, name } : s
            ),
          };
        }
        return p;
      });
      saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
      return { projects: updatedProjects };
    });
  },

  deleteSection: (projectId, sectionId) => {
    set((state) => {
      const updatedProjects = state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            sections: p.sections.filter((s) => s.id !== sectionId),
          };
        }
        return p;
      });
      // Move tasks from deleted section to project root
      const updatedTasks = state.tasks.map((t) =>
        t.sectionId === sectionId ? { ...t, sectionId: undefined } : t
      );
      saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { projects: updatedProjects, tasks: updatedTasks };
    });
  },

  // ========================================================================
  // LABELS
  // ========================================================================

  addLabel: (labelData) => {
    const newLabel: Label = {
      ...labelData,
      id: crypto.randomUUID(),
      createdAt: formatDate(new Date()),
    };

    set((state) => {
      const updatedLabels = [...state.labels, newLabel];
      saveToStorage(STORAGE_KEYS.LABELS, updatedLabels);
      return { labels: updatedLabels };
    });
  },

  updateLabel: (id, updates) => {
    set((state) => {
      const updatedLabels = state.labels.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      );
      saveToStorage(STORAGE_KEYS.LABELS, updatedLabels);
      return { labels: updatedLabels };
    });
  },

  deleteLabel: (id) => {
    set((state) => {
      const updatedLabels = state.labels.filter((l) => l.id !== id);
      // Remove label from all tasks
      const updatedTasks = state.tasks.map((t) => ({
        ...t,
        labelIds: t.labelIds.filter((labelId) => labelId !== id),
      }));
      saveToStorage(STORAGE_KEYS.LABELS, updatedLabels);
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { labels: updatedLabels, tasks: updatedTasks };
    });
  },

  getLabelById: (id) => {
    return get().labels.find((l) => l.id === id);
  },

  // ========================================================================
  // TASKS
  // ========================================================================

  addTask: (taskData) => {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: formatDate(now),
      updatedAt: formatDate(now),
      completed: false,
      reminders: [],
      subtasks: [],
      comments: [],
      isRecurringParent: false,
      labelIds: [],
    };

    set((state) => {
      const updatedTasks = [...state.tasks, newTask];
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: formatDate(new Date()) }
          : t
      );
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((t) => t.id !== id);
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  toggleTaskCompletion: (id) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return state;

      const now = new Date();
      const newCompletedState = !task.completed;

      // Mark current task as completed/uncompleted
      let updatedTasks = state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: newCompletedState,
              completedAt: newCompletedState ? formatDate(now) : undefined,
              status: newCompletedState ? TaskStatus.DONE : TaskStatus.TODO,
              updatedAt: formatDate(now),
            }
          : t
      );

      // If completing a recurring task, create next occurrence
      if (newCompletedState && task.recurrence) {
        const nextDate = getNextOccurrence(task.recurrence, task.dueDate ? parseDate(task.dueDate) : now);

        if (nextDate) {
          const nextTask: Task = {
            ...task,
            id: crypto.randomUUID(),
            completed: false,
            completedAt: undefined,
            status: TaskStatus.TODO,
            dueDate: formatDate(nextDate),
            createdAt: formatDate(now),
            updatedAt: formatDate(now),
          };

          updatedTasks = [...updatedTasks, nextTask];
        }
      }

      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);

      // Update karma if task was completed
      if (newCompletedState) {
        get().updateKarmaOnTaskCompletion(task);
      }

      return { tasks: updatedTasks };
    });
  },

  moveTask: (id, projectId, sectionId) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) =>
        t.id === id
          ? { ...t, projectId, sectionId, updatedAt: formatDate(new Date()) }
          : t
      );
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  duplicateTask: (id) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return state;

      const now = new Date();
      const duplicatedTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        title: `${task.title} (copy)`,
        createdAt: formatDate(now),
        updatedAt: formatDate(now),
        completed: false,
        completedAt: undefined,
      };

      const updatedTasks = [...state.tasks, duplicatedTask];
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  getTaskById: (id) => {
    return get().tasks.find((t) => t.id === id);
  },

  // ========================================================================
  // SUBTASKS
  // ========================================================================

  addSubtask: (taskId, title) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          const newSubtask: Subtask = {
            id: crypto.randomUUID(),
            title,
            completed: false,
            order: t.subtasks.length,
          };
          return {
            ...t,
            subtasks: [...t.subtasks, newSubtask],
            updatedAt: formatDate(new Date()),
          };
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
            updatedAt: formatDate(new Date()),
          };
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  deleteSubtask: (taskId, subtaskId) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
            updatedAt: formatDate(new Date()),
          };
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  // ========================================================================
  // COMMENTS
  // ========================================================================

  addComment: (taskId, content) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          const newComment: Comment = {
            id: crypto.randomUUID(),
            content,
            createdAt: formatDate(new Date()),
          };
          return {
            ...t,
            comments: [...t.comments, newComment],
            updatedAt: formatDate(new Date()),
          };
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  deleteComment: (taskId, commentId) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            comments: t.comments.filter((c) => c.id !== commentId),
            updatedAt: formatDate(new Date()),
          };
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  // ========================================================================
  // FILTERS
  // ========================================================================

  addFilter: (filterData) => {
    const newFilter: Filter = {
      ...filterData,
      id: crypto.randomUUID(),
      createdAt: formatDate(new Date()),
    };

    set((state) => {
      const updatedFilters = [...state.filters, newFilter];
      saveToStorage(STORAGE_KEYS.FILTERS, updatedFilters);
      return { filters: updatedFilters };
    });
  },

  updateFilter: (id, updates) => {
    set((state) => {
      const updatedFilters = state.filters.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      );
      saveToStorage(STORAGE_KEYS.FILTERS, updatedFilters);
      return { filters: updatedFilters };
    });
  },

  deleteFilter: (id) => {
    set((state) => {
      const updatedFilters = state.filters.filter((f) => f.id !== id);
      saveToStorage(STORAGE_KEYS.FILTERS, updatedFilters);
      return { filters: updatedFilters };
    });
  },

  // ========================================================================
  // REMINDERS
  // ========================================================================

  addReminder: (taskId, reminderData) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          const newReminder: Reminder = {
            ...reminderData,
            id: crypto.randomUUID(),
            taskId,
            createdAt: formatDate(new Date()),
          };
          return {
            ...t,
            reminders: [...t.reminders, newReminder],
            updatedAt: formatDate(new Date()),
          };
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  deleteReminder: (taskId, reminderId) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            reminders: t.reminders.filter((r) => r.id !== reminderId),
            updatedAt: formatDate(new Date()),
          };
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  // ========================================================================
  // VIEW STATE
  // ========================================================================

  setViewState: (viewState) => {
    set({ viewState });
    saveToStorage(STORAGE_KEYS.VIEW_STATE, viewState);
  },

  goToInbox: () => {
    get().setViewState({ type: ViewType.INBOX });
  },

  goToToday: () => {
    get().setViewState({ type: ViewType.TODAY });
  },

  goToUpcoming: () => {
    get().setViewState({ type: ViewType.UPCOMING });
  },

  goToProject: (projectId) => {
    get().setViewState({ type: ViewType.PROJECT, projectId });
  },

  goToLabel: (labelId) => {
    get().setViewState({ type: ViewType.LABEL, labelId });
  },

  goToFilter: (filterId) => {
    get().setViewState({ type: ViewType.FILTER, filterId });
  },

  goToInsights: () => {
    get().setViewState({ type: ViewType.INSIGHTS });
  },

  // ========================================================================
  // QUERIES
  // ========================================================================

  getTasksForCurrentView: () => {
    const { viewState } = get();

    switch (viewState.type) {
      case ViewType.INBOX:
        return get().tasks.filter((t) => !t.completed && !t.dueDate);
      case ViewType.TODAY:
        return get().getTasksForToday();
      case ViewType.UPCOMING:
        return get().getTasksForUpcoming();
      case ViewType.PROJECT:
        return viewState.projectId
          ? get().getTasksByProject(viewState.projectId)
          : [];
      case ViewType.LABEL:
        return viewState.labelId
          ? get().getTasksByLabel(viewState.labelId)
          : [];
      case ViewType.FILTER:
        const filter = get().filters.find((f) => f.id === viewState.filterId);
        return filter ? get().getTasksByFilter(filter.query) : [];
      case ViewType.COMPLETED:
        return get().tasks.filter((t) => t.completed);
      case ViewType.SEARCH:
        return viewState.searchQuery
          ? get().searchTasks(viewState.searchQuery)
          : [];
      default:
        return [];
    }
  },

  getTasksForToday: () => {
    const today = startOfDay(new Date());
    return get()
      .tasks.filter((t) => {
        if (t.completed) return false;
        if (!t.dueDate) return false;
        const taskDate = startOfDay(parseDate(t.dueDate));
        return taskDate.getTime() === today.getTime();
      })
      .sort((a, b) => a.priority.localeCompare(b.priority));
  },

  getTasksForUpcoming: () => {
    const today = startOfDay(new Date());
    const weekFromNow = addDays(today, 7);

    return get()
      .tasks.filter((t) => {
        if (t.completed) return false;
        if (!t.dueDate) return false;
        const taskDate = startOfDay(parseDate(t.dueDate));
        return taskDate > today && taskDate <= weekFromNow;
      })
      .sort((a, b) => {
        const dateCompare = (a.dueDate || '').localeCompare(b.dueDate || '');
        return dateCompare !== 0 ? dateCompare : a.priority.localeCompare(b.priority);
      });
  },

  getOverdueTasks: () => {
    const today = startOfDay(new Date());
    return get()
      .tasks.filter((t) => {
        if (t.completed) return false;
        if (!t.dueDate) return false;
        const taskDate = startOfDay(parseDate(t.dueDate));
        return taskDate < today;
      })
      .sort((a, b) => a.priority.localeCompare(b.priority));
  },

  getTasksByProject: (projectId, sectionId) => {
    return get()
      .tasks.filter((t) => {
        if (t.completed) return false;
        if (t.projectId !== projectId) return false;
        if (sectionId !== undefined && t.sectionId !== sectionId) return false;
        return true;
      })
      .sort((a, b) => a.priority.localeCompare(b.priority));
  },

  getTasksByLabel: (labelId) => {
    return get()
      .tasks.filter((t) => !t.completed && t.labelIds.includes(labelId))
      .sort((a, b) => a.priority.localeCompare(b.priority));
  },

  getTasksByFilter: (query) => {
    // Enhanced filter query parser
    // Format: "project:id & label:id & priority:p1 & due:today"
    let tasks = get().tasks.filter((t) => !t.completed);

    // Parse query parts (split by &)
    const parts = query.split('&').map((p) => p.trim());

    parts.forEach((part) => {
      const [key, value] = part.split(':').map((s) => s.trim());

      if (key === 'project' && value) {
        tasks = tasks.filter((t) => t.projectId === value);
      }

      if (key === 'label' && value) {
        tasks = tasks.filter((t) => t.labelIds.includes(value));
      }

      if (key === 'priority' && value) {
        tasks = tasks.filter((t) => t.priority === value);
      }

      if (key === 'due') {
        const today = startOfDay(new Date());

        if (value === 'today') {
          tasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            return isToday(parseDate(t.dueDate));
          });
        } else if (value === 'overdue') {
          tasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            const taskDate = startOfDay(parseDate(t.dueDate));
            return taskDate < today;
          });
        } else if (value === 'this_week') {
          const endOfWeek = addDays(today, 7);
          tasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            const taskDate = parseDate(t.dueDate);
            return taskDate >= today && taskDate <= endOfWeek;
          });
        } else if (value === 'no_date') {
          tasks = tasks.filter((t) => !t.dueDate);
        }
      }
    });

    return tasks.sort((a, b) => a.priority.localeCompare(b.priority));
  },

  searchTasks: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(lowerQuery) ||
        (t.description && t.description.toLowerCase().includes(lowerQuery))
    );
  },

  // ========================================================================
  // KARMA & PRODUCTIVITY
  // ========================================================================

  updateKarmaOnTaskCompletion: (task) => {
    set((state) => {
      const points = KARMA_POINTS[task.priority];
      const today = formatDate(new Date());
      const { karma } = state;

      // Check streak
      let newStreak = karma.currentStreak;
      if (karma.lastCompletionDate) {
        const lastDate = parseDate(karma.lastCompletionDate);
        const todayDate = parseDate(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          // Same day, keep streak
        } else if (diffDays === 1) {
          // Consecutive day, increment streak
          newStreak += 1;
        } else {
          // Streak broken
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const newTotalPoints = karma.totalPoints + points;
      const newLevel =
        KARMA_LEVELS.filter((l) => newTotalPoints >= l.pointsRequired).pop()
          ?.level || 1;

      const karmaEvent: KarmaEvent = {
        date: today,
        points,
        tasksCompleted: 1,
        reason: 'completed_task',
      };

      const updatedKarma: KarmaProfile = {
        ...karma,
        totalPoints: newTotalPoints,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: Math.max(karma.longestStreak, newStreak),
        lastCompletionDate: today,
        pointsHistory: [...karma.pointsHistory, karmaEvent],
      };

      saveToStorage(STORAGE_KEYS.KARMA, updatedKarma);
      return { karma: updatedKarma };
    });
  },

  getProductivityStats: () => {
    const { tasks } = get();
    const today = startOfDay(new Date());
    const weekAgo = addDays(today, -7);
    const monthAgo = addDays(today, -30);

    const completedTasks = tasks.filter((t) => t.completed && t.completedAt);

    const tasksCompletedToday = completedTasks.filter((t) =>
      isToday(parseDate(t.completedAt!))
    ).length;

    const tasksCompletedThisWeek = completedTasks.filter((t) => {
      const completedDate = parseDate(t.completedAt!);
      return completedDate >= weekAgo;
    }).length;

    const tasksCompletedThisMonth = completedTasks.filter((t) => {
      const completedDate = parseDate(t.completedAt!);
      return completedDate >= monthAgo;
    }).length;

    const completionsByProject: Record<string, number> = {};
    const completionsByLabel: Record<string, number> = {};
    const completionHeatmap: Record<string, number> = {};

    completedTasks.forEach((t) => {
      // By project
      completionsByProject[t.projectId] =
        (completionsByProject[t.projectId] || 0) + 1;

      // By label
      t.labelIds.forEach((labelId) => {
        completionsByLabel[labelId] = (completionsByLabel[labelId] || 0) + 1;
      });

      // Heatmap
      if (t.completedAt) {
        const date = t.completedAt.split('T')[0];
        completionHeatmap[date] = (completionHeatmap[date] || 0) + 1;
      }
    });

    return {
      tasksCompletedToday,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
      completionsByProject,
      completionsByLabel,
      completionHeatmap,
      mostProductiveDay: 'Monday', // TODO: Calculate from heatmap
      mostProductiveTime: '10:00 AM', // TODO: Calculate from completion times
      averageCompletionTime: 0, // TODO: Calculate based on time blocks
    };
  },

  checkDailyGoal: () => {
    const stats = get().getProductivityStats();
    return stats.tasksCompletedToday >= get().karma.dailyGoal;
  },

  checkWeeklyGoal: () => {
    const stats = get().getProductivityStats();
    return stats.tasksCompletedThisWeek >= get().karma.weeklyGoal;
  },

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  loadFromStorage: () => {
    const tasks = loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
    const projects = loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const labels = loadFromStorage<Label[]>(STORAGE_KEYS.LABELS, []);
    const filters = loadFromStorage<Filter[]>(STORAGE_KEYS.FILTERS, []);
    const karma = loadFromStorage<KarmaProfile>(STORAGE_KEYS.KARMA, {
      totalPoints: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      dailyGoal: 5,
      weeklyGoal: 30,
      pointsHistory: [],
    });
    const viewState = loadFromStorage<ViewState>(STORAGE_KEYS.VIEW_STATE, {
      type: ViewType.TODAY,
    });

    set({ tasks, projects, labels, filters, karma, viewState });

    // If no projects exist, run migration
    if (projects.length === 0) {
      get().migrateOldData();
    }
  },

  migrateOldData: () => {
    // Check for old data format (categories)
    const oldTasks = loadFromStorage<any[]>('tasks', []);

    if (oldTasks.length === 0) {
      // No old data, create default projects
      const inboxProject: Project = {
        id: crypto.randomUUID(),
        name: 'Inbox',
        color: '#999999',
        icon: '📥',
        isFavorite: true,
        isArchived: false,
        order: 0,
        createdAt: formatDate(new Date()),
        sections: [],
      };

      const workProject: Project = {
        id: crypto.randomUUID(),
        name: 'Work',
        color: '#2196F3',
        icon: '💼',
        isFavorite: true,
        isArchived: false,
        order: 1,
        createdAt: formatDate(new Date()),
        sections: [],
      };

      set({ projects: [inboxProject, workProject] });
      saveToStorage(STORAGE_KEYS.PROJECTS, [inboxProject, workProject]);
      return;
    }

    // Migrate old tasks to new format
    console.log('Migrating old data...');
    // Migration logic will be implemented in Phase 1.3
  },
}));
