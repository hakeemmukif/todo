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
} from '../types/task';
import { formatDate, parseDate, isToday, startOfDay, addDays } from '../utils/dateUtils';
import { getNextOccurrence } from '../utils/naturalLanguage';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { labelService } from '../services/labelService';
import { filterService } from '../services/filterService';
import { karmaService } from '../services/karmaService';
import { syncService } from '../services/syncService';
import { retryOperation } from '../hooks/useRetry';
import { toast } from '../utils/toast';
import { getCurrentUser } from '../lib/supabase';

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  filters: Filter[];
  karma: KarmaProfile;
  viewState: ViewState;
  theme: 'light' | 'dark';
  themeColor: string;
  userId: string | null;
  isLoading: boolean;

  initializeStore: () => Promise<void>;
  setUserId: (userId: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'sections'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (projectIds: string[]) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;

  addSection: (projectId: string, name: string) => Promise<void>;
  updateSection: (projectId: string, sectionId: string, name: string) => Promise<void>;
  deleteSection: (projectId: string, sectionId: string) => Promise<void>;

  addLabel: (label: Omit<Label, 'id' | 'createdAt'>) => Promise<void>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  getLabelById: (id: string) => Label | undefined;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'reminders' | 'subtasks' | 'comments' | 'isRecurringParent' | 'labelIds'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  moveTask: (id: string, projectId: string, sectionId?: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;

  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  addComment: (taskId: string, content: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;

  addFilter: (filter: Omit<Filter, 'id' | 'createdAt'>) => Promise<void>;
  updateFilter: (id: string, updates: Partial<Filter>) => Promise<void>;
  deleteFilter: (id: string) => Promise<void>;

  addReminder: (taskId: string, reminder: Omit<Reminder, 'id' | 'taskId' | 'createdAt'>) => Promise<void>;
  deleteReminder: (taskId: string, reminderId: string) => Promise<void>;

  setViewState: (viewState: ViewState) => void;
  goToInbox: () => void;
  goToToday: () => void;
  goToUpcoming: () => void;
  goToProject: (projectId: string) => void;
  goToLabel: (labelId: string) => void;
  goToFilter: (filterId: string) => void;
  goToInsights: () => void;
  goToCompleted: () => void;

  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setThemeColor: (color: string) => void;

  getTasksForCurrentView: () => Task[];
  getTasksForToday: () => Task[];
  getTasksForUpcoming: () => Task[];
  getOverdueTasks: () => Task[];
  getTasksByProject: (projectId: string, sectionId?: string) => Task[];
  getTasksByLabel: (labelId: string) => Task[];
  getTasksByFilter: (query: string) => Task[];
  searchTasks: (query: string) => Task[];

  getProductivityStats: () => ProductivityStats;
  checkDailyGoal: () => boolean;
  checkWeeklyGoal: () => boolean;

  loadFromStorage: () => void;
  migrateOldData: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
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
  viewState: { type: ViewType.TODAY },
  theme: 'light',
  themeColor: '#dc4c3e',
  userId: null,
  isLoading: false,

  setUserId: (userId) => set({ userId }),

  initializeStore: async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    console.log('[Store] Initializing for user:', user.id);
    set({ isLoading: true, userId: user.id });

    try {
      const data = await retryOperation(() => syncService.syncAllData(user.id));
      console.log('[Store] Synced data:', {
        tasks: data.tasks.length,
        projects: data.projects.length,
        labels: data.labels.length,
        filters: data.filters.length,
      });
      set({
        tasks: data.tasks as Task[],
        projects: data.projects as Project[],
        labels: data.labels as Label[],
        filters: data.filters as Filter[],
        karma: data.karma || get().karma,
        isLoading: false,
      });
      console.log('[Store] State updated with tasks:', get().tasks.length);
      toast.success('Data synced successfully');
    } catch (error: any) {
      console.error('Failed to initialize store:', error);
      toast.error('Failed to load data');
      set({ isLoading: false });
      throw error;
    }
  },

  addProject: async (projectData) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');

    const tempId = crypto.randomUUID();
    const optimisticProject: Project = {
      ...projectData,
      id: tempId,
      createdAt: formatDate(new Date()),
      sections: [],
    };

    set((state) => ({ projects: [...state.projects, optimisticProject] }));

    try {
      const newProject = await retryOperation(() =>
        projectService.createProject({ ...projectData, user_id: userId, order: get().projects.length })
      );
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === tempId ? { ...syncService.dbProjectToLocal(newProject), sections: [] } as Project : p
        ),
      }));
      toast.success('Project created');
    } catch (error: any) {
      set((state) => ({ projects: state.projects.filter((p) => p.id !== tempId) }));
      toast.error('Failed to create project');
      throw error;
    }
  },

  updateProject: async (id, updates) => {
    set((state) => ({ projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
    try {
      await retryOperation(() => projectService.updateProject(id, updates));
    } catch (error: any) {
      toast.error('Failed to update project');
      await get().initializeStore();
    }
  },

  deleteProject: async (id) => {
    const backup = get().projects;
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => t.projectId !== id),
    }));
    try {
      await retryOperation(() => projectService.deleteProject(id));
      toast.success('Project deleted');
    } catch (error: any) {
      set({ projects: backup });
      toast.error('Failed to delete project');
    }
  },

  reorderProjects: async (projectIds) => {
    const backup = get().projects;
    const projectMap = new Map(backup.map((p) => [p.id, p]));
    const reordered = projectIds.map((id, index) => {
      const project = projectMap.get(id);
      return project ? { ...project, order: index } : null;
    }).filter((p): p is Project => p !== null);

    set({ projects: reordered });
    try {
      await retryOperation(() => projectService.reorderProjects(projectIds.map((id, index) => ({ id, order: index }))));
    } catch (error: any) {
      set({ projects: backup });
      toast.error('Failed to reorder projects');
    }
  },

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  addSection: async (projectId, name) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;

    const tempId = crypto.randomUUID();
    const optimisticSection: Section = {
      id: tempId,
      projectId,
      name,
      order: project.sections.length,
      createdAt: formatDate(new Date()),
    };

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, sections: [...p.sections, optimisticSection] } : p
      ),
    }));

    try {
      const newSection = await retryOperation(() =>
        projectService.createSection({ project_id: projectId, user_id: userId, name, order: project.sections.length })
      );
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, sections: p.sections.map((s) => (s.id === tempId ? syncService.dbSectionToLocal(newSection) : s)) }
            : p
        ),
      }));
    } catch (error: any) {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, sections: p.sections.filter((s) => s.id !== tempId) } : p
        ),
      }));
      toast.error('Failed to create section');
    }
  },

  updateSection: async (projectId, sectionId, name) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, sections: p.sections.map((s) => (s.id === sectionId ? { ...s, name } : s)) }
          : p
      ),
    }));
    try {
      await retryOperation(() => projectService.updateSection(sectionId, { name }));
    } catch (error: any) {
      toast.error('Failed to update section');
      await get().initializeStore();
    }
  },

  deleteSection: async (projectId, sectionId) => {
    const backup = get().projects;
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId) } : p
      ),
      tasks: state.tasks.map((t) => (t.sectionId === sectionId ? { ...t, sectionId: undefined } : t)),
    }));
    try {
      await retryOperation(() => projectService.deleteSection(sectionId));
    } catch (error: any) {
      set({ projects: backup });
      toast.error('Failed to delete section');
    }
  },

  addLabel: async (labelData) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');

    const tempId = crypto.randomUUID();
    const optimisticLabel: Label = { ...labelData, id: tempId, createdAt: formatDate(new Date()) };
    set((state) => ({ labels: [...state.labels, optimisticLabel] }));

    try {
      const newLabel = await retryOperation(() => labelService.createLabel({ ...labelData, user_id: userId }));
      set((state) => ({ labels: state.labels.map((l) => (l.id === tempId ? syncService.dbLabelToLocal(newLabel) : l)) }));
    } catch (error: any) {
      set((state) => ({ labels: state.labels.filter((l) => l.id !== tempId) }));
      toast.error('Failed to create label');
    }
  },

  updateLabel: async (id, updates) => {
    set((state) => ({ labels: state.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)) }));
    try {
      await retryOperation(() => labelService.updateLabel(id, updates));
    } catch (error: any) {
      toast.error('Failed to update label');
      await get().initializeStore();
    }
  },

  deleteLabel: async (id) => {
    const backup = { labels: get().labels, tasks: get().tasks };
    set((state) => ({
      labels: state.labels.filter((l) => l.id !== id),
      tasks: state.tasks.map((t) => ({ ...t, labelIds: t.labelIds.filter((labelId) => labelId !== id) })),
    }));
    try {
      await retryOperation(() => labelService.deleteLabel(id));
    } catch (error: any) {
      set(backup);
      toast.error('Failed to delete label');
    }
  },

  getLabelById: (id) => get().labels.find((l) => l.id === id),

  addTask: async (taskData) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');

    console.log('[Store] Adding task for user:', userId, 'Task:', taskData);

    const now = new Date();
    const tempId = crypto.randomUUID();
    const optimisticTask: Task = {
      ...taskData,
      id: tempId,
      createdAt: formatDate(now),
      updatedAt: formatDate(now),
      completed: false,
      reminders: [],
      subtasks: [],
      comments: [],
      isRecurringParent: false,
      labelIds: [],
    };

    set((state) => ({ tasks: [...state.tasks, optimisticTask] }));
    console.log('[Store] Optimistic task added, total tasks:', get().tasks.length);

    try {
      const newTask = await retryOperation(() =>
        taskService.createTask({
          user_id: userId,
          project_id: taskData.projectId,
          section_id: taskData.sectionId || null,
          title: taskData.title,
          description: taskData.description || null,
          priority: taskData.priority || 'p4',
          due_date: taskData.dueDate || null,
          recurrence: taskData.recurrence as any || null,
          status: taskData.status as any || 'todo',
          order: get().tasks.length,
        })
      );
      console.log('[Store] Task created in DB:', newTask.id);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === tempId ? { ...syncService.dbTaskToLocal(newTask), reminders: [], subtasks: [], comments: [], labelIds: [] } : t
        ),
      }));
      console.log('[Store] Task replaced with DB version, total tasks:', get().tasks.length);
    } catch (error: any) {
      console.error('[Store] Failed to create task:', error);
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== tempId) }));
      toast.error('Failed to create task');
    }
  },

  updateTask: async (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: formatDate(new Date()) } : t)),
    }));
    try {
      await retryOperation(() => taskService.updateTask(id, updates as any));
    } catch (error: any) {
      toast.error('Failed to update task');
      await get().initializeStore();
    }
  },

  deleteTask: async (id) => {
    const backup = get().tasks;
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await retryOperation(() => taskService.deleteTask(id));
    } catch (error: any) {
      set({ tasks: backup });
      toast.error('Failed to delete task');
    }
  },

  toggleTaskCompletion: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');

    const now = new Date();
    const newCompletedState = !task.completed;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: newCompletedState,
              completedAt: newCompletedState ? formatDate(now) : undefined,
              status: newCompletedState ? TaskStatus.DONE : TaskStatus.TODO,
              updatedAt: formatDate(now),
            }
          : t
      ),
    }));

    try {
      await retryOperation(() => taskService.toggleTaskCompletion(id, newCompletedState));

      if (newCompletedState) {
        const karmaProfile = await karmaService.getKarmaProfile(userId);
        if (karmaProfile) {
          const updatedProfile = await retryOperation(() =>
            karmaService.updateKarmaOnTaskCompletion(userId, KARMA_POINTS[task.priority], karmaProfile)
          );
          const karmaEvents = await karmaService.getKarmaEvents(userId, 50);
          set({
            karma: {
              ...syncService.dbKarmaToLocal(updatedProfile),
              pointsHistory: karmaEvents.map((e) => ({
                date: e.date,
                points: e.points,
                tasksCompleted: e.tasks_completed,
                reason: e.reason,
              })),
            },
          });
        }
      }

      if (newCompletedState && task.recurrence) {
        const nextDate = getNextOccurrence(task.recurrence, task.dueDate ? parseDate(task.dueDate) : now);
        if (nextDate) {
          await get().addTask({ ...task, dueDate: formatDate(nextDate) });
        }
      }
    } catch (error: any) {
      set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? task : t)) }));
      toast.error('Failed to update task');
    }
  },

  moveTask: async (id, projectId, sectionId) => {
    const backup = get().tasks.find((t) => t.id === id);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, projectId, sectionId, updatedAt: formatDate(new Date()) } : t
      ),
    }));
    try {
      await retryOperation(() => taskService.moveTask(id, projectId, sectionId));
    } catch (error: any) {
      if (backup) {
        set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? backup : t)) }));
      }
      toast.error('Failed to move task');
    }
  },

  duplicateTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    await get().addTask({ ...task, title: `${task.title} (copy)` });
  },

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  addSubtask: async (taskId, title) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const tempId = crypto.randomUUID();
    const optimisticSubtask: Subtask = { id: tempId, title, completed: false, order: task.subtasks.length };
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, optimisticSubtask], updatedAt: formatDate(new Date()) } : t
      ),
    }));

    try {
      const newSubtask = await retryOperation(() => taskService.createSubtask(taskId, title, task.subtasks.length));
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === tempId && newSubtask
                    ? { id: (newSubtask as any).id, title: (newSubtask as any).title, completed: (newSubtask as any).completed, order: (newSubtask as any).order }
                    : s
                ),
              }
            : t
        ),
      }));
    } catch (error: any) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== tempId) } : t
        ),
      }));
      toast.error('Failed to add subtask');
    }
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    const subtask = task?.subtasks.find((s) => s.id === subtaskId);
    if (!task || !subtask) return;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)),
              updatedAt: formatDate(new Date()),
            }
          : t
      ),
    }));

    try {
      await retryOperation(() => taskService.toggleSubtask(subtaskId, !subtask.completed));
    } catch (error: any) {
      set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? task : t)) }));
      toast.error('Failed to toggle subtask');
    }
  },

  deleteSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId), updatedAt: formatDate(new Date()) }
          : t
      ),
    }));

    try {
      await retryOperation(() => taskService.deleteSubtask(subtaskId));
    } catch (error: any) {
      set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? task : t)) }));
      toast.error('Failed to delete subtask');
    }
  },

  addComment: async (taskId, content) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const tempId = crypto.randomUUID();
    const optimisticComment: Comment = { id: tempId, content, createdAt: formatDate(new Date()) };
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...t.comments, optimisticComment], updatedAt: formatDate(new Date()) }
          : t
      ),
    }));

    try {
      const newComment = await retryOperation(() => taskService.createComment(taskId, content));
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: t.comments.map((c) =>
                  c.id === tempId && newComment ? { id: (newComment as any).id, content: (newComment as any).content, createdAt: (newComment as any).created_at } : c
                ),
              }
            : t
        ),
      }));
    } catch (error: any) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, comments: t.comments.filter((c) => c.id !== tempId) } : t
        ),
      }));
      toast.error('Failed to add comment');
    }
  },

  deleteComment: async (taskId, commentId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, comments: t.comments.filter((c) => c.id !== commentId), updatedAt: formatDate(new Date()) }
          : t
      ),
    }));

    try {
      await retryOperation(() => taskService.deleteComment(commentId));
    } catch (error: any) {
      set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? task : t)) }));
      toast.error('Failed to delete comment');
    }
  },

  addFilter: async (filterData) => {
    const { userId } = get();
    if (!userId) throw new Error('Not authenticated');

    const tempId = crypto.randomUUID();
    const optimisticFilter: Filter = { ...filterData, id: tempId, createdAt: formatDate(new Date()) };
    set((state) => ({ filters: [...state.filters, optimisticFilter] }));

    try {
      const newFilter = await retryOperation(() => filterService.createFilter({ ...filterData, user_id: userId }));
      set((state) => ({ filters: state.filters.map((f) => (f.id === tempId ? syncService.dbFilterToLocal(newFilter) : f)) }));
    } catch (error: any) {
      set((state) => ({ filters: state.filters.filter((f) => f.id !== tempId) }));
      toast.error('Failed to create filter');
    }
  },

  updateFilter: async (id, updates) => {
    set((state) => ({ filters: state.filters.map((f) => (f.id === id ? { ...f, ...updates } : f)) }));
    try {
      await retryOperation(() => filterService.updateFilter(id, updates));
    } catch (error: any) {
      toast.error('Failed to update filter');
      await get().initializeStore();
    }
  },

  deleteFilter: async (id) => {
    const backup = get().filters;
    set((state) => ({ filters: state.filters.filter((f) => f.id !== id) }));
    try {
      await retryOperation(() => filterService.deleteFilter(id));
    } catch (error: any) {
      set({ filters: backup });
      toast.error('Failed to delete filter');
    }
  },

  addReminder: async (taskId, reminderData) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const tempId = crypto.randomUUID();
    const optimisticReminder: Reminder = {
      ...reminderData,
      id: tempId,
      taskId,
      isTriggered: false,
      createdAt: formatDate(new Date())
    };
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, reminders: [...t.reminders, optimisticReminder], updatedAt: formatDate(new Date()) }
          : t
      ),
    }));

    try {
      const newReminder = await retryOperation(() =>
        taskService.createReminder(taskId, {
          task_id: taskId,
          type: reminderData.type,
          date_time: reminderData.dateTime || null,
          relative_minutes: reminderData.relativeMinutes || null,
        })
      );
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                reminders: t.reminders.map((r) =>
                  r.id === tempId
                    ? {
                        id: newReminder.id,
                        taskId: newReminder.task_id,
                        type: newReminder.type,
                        dateTime: newReminder.date_time,
                        relativeMinutes: newReminder.relative_minutes,
                        isTriggered: newReminder.is_triggered,
                        createdAt: newReminder.created_at,
                      }
                    : r
                ),
              }
            : t
        ),
      }));
    } catch (error: any) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, reminders: t.reminders.filter((r) => r.id !== tempId) } : t
        ),
      }));
      toast.error('Failed to add reminder');
    }
  },

  deleteReminder: async (taskId, reminderId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, reminders: t.reminders.filter((r) => r.id !== reminderId), updatedAt: formatDate(new Date()) }
          : t
      ),
    }));

    try {
      await retryOperation(() => taskService.deleteReminder(reminderId));
    } catch (error: any) {
      set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? task : t)) }));
      toast.error('Failed to delete reminder');
    }
  },

  setViewState: (viewState) => {
    set({ viewState });
    localStorage.setItem('todoist_view_state', JSON.stringify(viewState));
  },

  goToInbox: () => get().setViewState({ type: ViewType.INBOX }),
  goToToday: () => get().setViewState({ type: ViewType.TODAY }),
  goToUpcoming: () => get().setViewState({ type: ViewType.UPCOMING }),
  goToProject: (projectId) => get().setViewState({ type: ViewType.PROJECT, projectId }),
  goToLabel: (labelId) => get().setViewState({ type: ViewType.LABEL, labelId }),
  goToFilter: (filterId) => get().setViewState({ type: ViewType.FILTER, filterId }),
  goToInsights: () => get().setViewState({ type: ViewType.INSIGHTS }),
  goToCompleted: () => get().setViewState({ type: ViewType.COMPLETED }),

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('todoist_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    });
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('todoist_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setThemeColor: (color) => {
    set({ themeColor: color });
    localStorage.setItem('todoist_theme_color', color);
    document.documentElement.style.setProperty('--theme-color', color);
  },

  getTasksForCurrentView: () => {
    const { viewState, tasks, filters } = get();
    switch (viewState.type) {
      case ViewType.INBOX:
        return tasks.filter((t) => !t.completed && !t.dueDate);
      case ViewType.TODAY:
        return get().getTasksForToday();
      case ViewType.UPCOMING:
        return get().getTasksForUpcoming();
      case ViewType.PROJECT:
        return viewState.projectId ? get().getTasksByProject(viewState.projectId) : [];
      case ViewType.LABEL:
        return viewState.labelId ? get().getTasksByLabel(viewState.labelId) : [];
      case ViewType.FILTER:
        const filter = filters.find((f) => f.id === viewState.filterId);
        return filter ? get().getTasksByFilter(filter.query) : [];
      case ViewType.COMPLETED:
        return tasks.filter((t) => t.completed);
      case ViewType.SEARCH:
        return viewState.searchQuery ? get().searchTasks(viewState.searchQuery) : [];
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
    let tasks = get().tasks.filter((t) => !t.completed);
    const parts = query.split('&').map((p) => p.trim());

    parts.forEach((part) => {
      const [key, value] = part.split(':').map((s) => s.trim());
      if (key === 'project' && value) tasks = tasks.filter((t) => t.projectId === value);
      if (key === 'label' && value) tasks = tasks.filter((t) => t.labelIds.includes(value));
      if (key === 'priority' && value) tasks = tasks.filter((t) => t.priority === value);
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

  getProductivityStats: () => {
    const { tasks } = get();
    const today = startOfDay(new Date());
    const weekAgo = addDays(today, -7);
    const monthAgo = addDays(today, -30);

    const completedTasks = tasks.filter((t) => t.completed && t.completedAt);
    const tasksCompletedToday = completedTasks.filter((t) => isToday(parseDate(t.completedAt!))).length;
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
      completionsByProject[t.projectId] = (completionsByProject[t.projectId] || 0) + 1;
      t.labelIds.forEach((labelId) => {
        completionsByLabel[labelId] = (completionsByLabel[labelId] || 0) + 1;
      });
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
      mostProductiveDay: 'Monday',
      mostProductiveTime: '10:00 AM',
      averageCompletionTime: 0,
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

  loadFromStorage: () => {
    console.warn('loadFromStorage is deprecated, use initializeStore instead');
  },

  migrateOldData: () => {
    console.warn('migrateOldData is not implemented');
  },
}));
