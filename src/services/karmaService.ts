// @ts-nocheck
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type KarmaProfileRow = Database['public']['Tables']['karma_profiles']['Row'];
type KarmaProfileUpdate = Database['public']['Tables']['karma_profiles']['Update'];
type KarmaEventInsert = Database['public']['Tables']['karma_events']['Insert'];

export const karmaService = {
  async getKarmaProfile(userId: string): Promise<KarmaProfileRow | null> {
    const { data, error } = await supabase
      .from('karma_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // No profile exists (404 or PGRST116), create one
      if (error.code === 'PGRST116' || error.message?.includes('406')) {
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('karma_profiles')
            .insert({
              user_id: userId,
              total_points: 0,
              level: 1,
              current_streak: 0,
              longest_streak: 0,
              daily_goal: 5,
              weekly_goal: 30,
            })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create karma profile:', createError);
            return null;
          }
          return newProfile;
        } catch (err) {
          console.error('Error creating karma profile:', err);
          return null;
        }
      }
      throw error;
    }
    return data;
  },

  async updateKarmaProfile(userId: string, updates: KarmaProfileUpdate): Promise<KarmaProfileRow> {
    const { data, error } = await supabase
      .from('karma_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addKarmaEvent(event: KarmaEventInsert): Promise<void> {
    const { error } = await supabase
      .from('karma_events')
      .insert(event);

    if (error) throw error;
  },

  async getKarmaEvents(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('karma_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async updateKarmaOnTaskCompletion(
    userId: string,
    points: number,
    currentProfile: KarmaProfileRow
  ): Promise<KarmaProfileRow> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let newStreak = currentProfile.current_streak;

    if (currentProfile.last_completion_date) {
      const lastDate = new Date(currentProfile.last_completion_date);
      const lastDateStr = lastDate.toISOString().split('T')[0];

      if (lastDateStr === today) {
        // Same day, keep streak
      } else {
        const diffDays = Math.floor(
          (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          // Consecutive day, increment streak
          newStreak += 1;
        } else {
          // Streak broken
          newStreak = 1;
        }
      }
    } else {
      newStreak = 1;
    }

    const newTotalPoints = currentProfile.total_points + points;

    const KARMA_LEVELS = [
      { level: 1, pointsRequired: 0 },
      { level: 2, pointsRequired: 50 },
      { level: 3, pointsRequired: 150 },
      { level: 4, pointsRequired: 300 },
      { level: 5, pointsRequired: 500 },
      { level: 6, pointsRequired: 750 },
      { level: 7, pointsRequired: 1000 },
      { level: 8, pointsRequired: 1500 },
      { level: 9, pointsRequired: 2000 },
      { level: 10, pointsRequired: 3000 },
    ];

    const newLevel =
      KARMA_LEVELS.filter((l) => newTotalPoints >= l.pointsRequired).pop()?.level || 1;

    await this.addKarmaEvent({
      user_id: userId,
      points,
      tasks_completed: 1,
      reason: 'completed_task',
      date: now.toISOString(),
    });

    return this.updateKarmaProfile(userId, {
      total_points: newTotalPoints,
      level: newLevel,
      current_streak: newStreak,
      longest_streak: Math.max(currentProfile.longest_streak, newStreak),
      last_completion_date: now.toISOString(),
    });
  },
};
