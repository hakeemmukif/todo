// @ts-nocheck
import { supabase } from '../lib/supabase';
import { taskService } from './taskService';
import { projectService } from './projectService';
import { labelService } from './labelService';
import { filterService } from './filterService';
import { karmaService } from './karmaService';
import { logger } from '../utils/logger';
import type { Database } from '../types/database';
import type { Task, Project, Label, Filter, KarmaProfile, Section } from '../types/task';

const ENABLE_OFFLINE_MODE = import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  hasPendingChanges: boolean;
  error: string | null;
}

type DbTask = Database['public']['Tables']['tasks']['Row'];
type DbProject = Database['public']['Tables']['projects']['Row'];
type DbSection = Database['public']['Tables']['sections']['Row'];
type DbLabel = Database['public']['Tables']['labels']['Row'];
type DbFilter = Database['public']['Tables']['filters']['Row'];
type DbKarmaProfile = Database['public']['Tables']['karma_profiles']['Row'];

export const syncService = {
  async syncAllData(userId: string) {
    try {
      let [projects, tasks, labels, filters, karmaProfile] = await Promise.all([
        projectService.getAllProjects(userId),
        taskService.getAllTasks(userId),
        labelService.getAllLabels(userId),
        filterService.getAllFilters(userId),
        karmaService.getKarmaProfile(userId),
      ]);

      // Filter out any "Inbox" projects (Inbox is a view, not a project)
      projects = projects.filter(p => p.name.toLowerCase() !== 'inbox');

      const projectsWithSections = await Promise.all(
        projects.map(async (project) => {
          const sections = await projectService.getSections(project.id);
          return {
            ...this.dbProjectToLocal(project),
            sections: sections.map(this.dbSectionToLocal),
          };
        })
      );

      const tasksWithRelations = await Promise.all(
        tasks.map(async (task) => {
          const [subtasks, comments, reminders, labelIds] = await Promise.all([
            taskService.getSubtasks(task.id),
            taskService.getComments(task.id),
            taskService.getReminders(task.id),
            taskService.getTaskLabels(task.id),
          ]);

          return {
            ...this.dbTaskToLocal(task),
            subtasks: subtasks.map(s => ({
              id: s.id,
              title: s.title,
              completed: s.completed,
              order: s.order,
            })),
            comments: comments.map(c => ({
              id: c.id,
              content: c.content,
              createdAt: c.created_at,
            })),
            reminders: reminders.map(r => ({
              id: r.id,
              taskId: r.task_id,
              type: r.type,
              dateTime: r.date_time,
              relativeMinutes: r.relative_minutes,
              isTriggered: r.is_triggered,
              createdAt: r.created_at,
            })),
            labelIds,
          };
        })
      );

      return {
        projects: projectsWithSections,
        tasks: tasksWithRelations,
        labels: labels.map(this.dbLabelToLocal),
        filters: filters.map(this.dbFilterToLocal),
        karma: karmaProfile ? this.dbKarmaToLocal(karmaProfile) : null,
      };
    } catch (error) {
      logger.error('Failed to sync all data', {
        data: { error, userId },
        context: { service: 'syncService', method: 'syncAllData' }
      });
      console.error('Sync error:', error);
      throw error;
    }
  },

  dbTaskToLocal(dbTask: DbTask): Omit<Task, 'subtasks' | 'comments' | 'reminders' | 'labelIds'> {
    return {
      id: dbTask.id,
      projectId: dbTask.project_id,
      sectionId: dbTask.section_id || undefined,
      title: dbTask.title,
      description: dbTask.description || undefined,
      priority: dbTask.priority,
      dueDate: dbTask.due_date || undefined,
      recurrence: dbTask.recurrence || undefined,
      status: dbTask.status,
      completed: dbTask.completed,
      completedAt: dbTask.completed_at || undefined,
      order: dbTask.order,
      isRecurringParent: dbTask.is_recurring_parent,
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at,
    };
  },

  dbProjectToLocal(dbProject: DbProject): Omit<Project, 'sections'> {
    return {
      id: dbProject.id,
      name: dbProject.name,
      color: dbProject.color,
      isFavorite: dbProject.is_favorite,
      viewStyle: dbProject.view_style,
      order: dbProject.order,
      createdAt: dbProject.created_at,
    };
  },

  dbSectionToLocal(dbSection: DbSection): Section {
    return {
      id: dbSection.id,
      projectId: dbSection.project_id,
      name: dbSection.name,
      order: dbSection.order,
      createdAt: dbSection.created_at,
    };
  },

  dbLabelToLocal(dbLabel: DbLabel): Label {
    return {
      id: dbLabel.id,
      name: dbLabel.name,
      color: dbLabel.color,
      createdAt: dbLabel.created_at,
    };
  },

  dbFilterToLocal(dbFilter: DbFilter): Filter {
    return {
      id: dbFilter.id,
      name: dbFilter.name,
      color: dbFilter.color,
      query: dbFilter.query,
      isFavorite: dbFilter.is_favorite,
      createdAt: dbFilter.created_at,
    };
  },

  dbKarmaToLocal(dbKarma: DbKarmaProfile): Omit<KarmaProfile, 'pointsHistory'> {
    return {
      totalPoints: dbKarma.total_points,
      level: dbKarma.level,
      currentStreak: dbKarma.current_streak,
      longestStreak: dbKarma.longest_streak,
      dailyGoal: dbKarma.daily_goal,
      weeklyGoal: dbKarma.weekly_goal,
      lastCompletionDate: dbKarma.last_completion_date || undefined,
    };
  },

  subscribeToChanges(
    userId: string,
    onTaskChange: (payload: any) => void,
    onProjectChange: (payload: any) => void
  ) {
    const tasksChannel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        onTaskChange
      )
      .subscribe();

    const projectsChannel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`,
        },
        onProjectChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(projectsChannel);
    };
  },

  async saveToLocalStorage(key: string, data: any): Promise<void> {
    if (!ENABLE_OFFLINE_MODE) return;

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save to localStorage', {
        data: { error, key },
        context: { service: 'syncService', method: 'saveToLocalStorage' }
      });
      console.error('Failed to save to localStorage:', error);
    }
  },

  loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    if (!ENABLE_OFFLINE_MODE) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
};
