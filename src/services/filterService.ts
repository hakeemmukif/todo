import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type FilterRow = Database['public']['Tables']['filters']['Row'];
type FilterInsert = Database['public']['Tables']['filters']['Insert'];
type FilterUpdate = Database['public']['Tables']['filters']['Update'];

export const filterService = {
  async getAllFilters(userId: string): Promise<FilterRow[]> {
    const { data, error } = await supabase
      .from('filters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getFilterById(filterId: string): Promise<FilterRow | null> {
    const { data, error } = await supabase
      .from('filters')
      .select('*')
      .eq('id', filterId)
      .single();

    if (error) throw error;
    return data;
  },

  async createFilter(filter: FilterInsert): Promise<FilterRow> {
    const { data, error } = await supabase
      .from('filters')
      .insert(filter)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFilter(filterId: string, updates: FilterUpdate): Promise<FilterRow> {
    const { data, error } = await supabase
      .from('filters')
      .update(updates)
      .eq('id', filterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFilter(filterId: string): Promise<void> {
    const { error } = await supabase
      .from('filters')
      .delete()
      .eq('id', filterId);

    if (error) throw error;
  },
};
