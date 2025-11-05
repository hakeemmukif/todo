import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
type SectionRow = Database['public']['Tables']['sections']['Row'];
type SectionInsert = Database['public']['Tables']['sections']['Insert'];
type SectionUpdate = Database['public']['Tables']['sections']['Update'];

export const projectService = {
  async getAllProjects(userId: string): Promise<ProjectRow[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getProjectById(projectId: string): Promise<ProjectRow | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  },

  async createProject(project: ProjectInsert): Promise<ProjectRow> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProject(projectId: string, updates: ProjectUpdate): Promise<ProjectRow> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  },

  async reorderProjects(projectOrders: { id: string; order: number }[]): Promise<void> {
    const updates = projectOrders.map(({ id, order }) =>
      supabase
        .from('projects')
        .update({ order })
        .eq('id', id)
    );

    await Promise.all(updates);
  },

  async getSections(projectId: string): Promise<SectionRow[]> {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSection(section: SectionInsert): Promise<SectionRow> {
    const { data, error } = await supabase
      .from('sections')
      .insert(section)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSection(sectionId: string, updates: SectionUpdate): Promise<SectionRow> {
    const { data, error } = await supabase
      .from('sections')
      .update(updates)
      .eq('id', sectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSection(sectionId: string): Promise<void> {
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', sectionId);

    if (error) throw error;
  },
};
