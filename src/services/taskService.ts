import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Task } from '../types/task';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export interface DbTask extends Omit<Task, 'subtasks' | 'comments' | 'reminders' | 'labelIds'> {
  user_id: string;
}

export const taskService = {
  async getAllTasks(userId: string): Promise<TaskRow[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getTaskById(taskId: string): Promise<TaskRow | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  },

  async getTasksByProject(projectId: string, sectionId?: string): Promise<TaskRow[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });

    if (sectionId !== undefined) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createTask(task: TaskInsert): Promise<TaskRow> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId: string, updates: TaskUpdate): Promise<TaskRow> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  async toggleTaskCompletion(taskId: string, completed: boolean): Promise<TaskRow> {
    const updates: TaskUpdate = {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      status: completed ? 'done' : 'todo',
    };

    return this.updateTask(taskId, updates);
  },

  async moveTask(taskId: string, projectId: string, sectionId?: string): Promise<TaskRow> {
    return this.updateTask(taskId, { project_id: projectId, section_id: sectionId });
  },

  async getTaskLabels(taskId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('task_labels')
      .select('label_id')
      .eq('task_id', taskId);

    if (error) throw error;
    return data?.map(row => row.label_id) || [];
  },

  async addLabelToTask(taskId: string, labelId: string): Promise<void> {
    const { error } = await supabase
      .from('task_labels')
      .insert({ task_id: taskId, label_id: labelId });

    if (error) throw error;
  },

  async removeLabelFromTask(taskId: string, labelId: string): Promise<void> {
    const { error } = await supabase
      .from('task_labels')
      .delete()
      .eq('task_id', taskId)
      .eq('label_id', labelId);

    if (error) throw error;
  },

  async getSubtasks(taskId: string) {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSubtask(taskId: string, title: string, order: number) {
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        title,
        order,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleSubtask(subtaskId: string, completed: boolean) {
    const { data, error } = await supabase
      .from('subtasks')
      .update({ completed })
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSubtask(subtaskId: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;
  },

  async getComments(taskId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createComment(taskId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        task_id: taskId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  async getReminders(taskId: string) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createReminder(taskId: string, reminderData: Database['public']['Tables']['reminders']['Insert']) {
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        ...reminderData,
        task_id: taskId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReminder(reminderId: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);

    if (error) throw error;
  },
};
