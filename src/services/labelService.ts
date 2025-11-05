import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type LabelRow = Database['public']['Tables']['labels']['Row'];
type LabelInsert = Database['public']['Tables']['labels']['Insert'];
type LabelUpdate = Database['public']['Tables']['labels']['Update'];

export const labelService = {
  async getAllLabels(userId: string): Promise<LabelRow[]> {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getLabelById(labelId: string): Promise<LabelRow | null> {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('id', labelId)
      .single();

    if (error) throw error;
    return data;
  },

  async createLabel(label: LabelInsert): Promise<LabelRow> {
    const { data, error } = await supabase
      .from('labels')
      .insert(label)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLabel(labelId: string, updates: LabelUpdate): Promise<LabelRow> {
    const { data, error } = await supabase
      .from('labels')
      .update(updates)
      .eq('id', labelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLabel(labelId: string): Promise<void> {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', labelId);

    if (error) throw error;
  },
};
