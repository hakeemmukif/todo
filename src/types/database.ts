export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          is_favorite: boolean
          view_style: 'list' | 'board'
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          is_favorite?: boolean
          view_style?: 'list' | 'board'
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          is_favorite?: boolean
          view_style?: 'list' | 'board'
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          project_id: string
          user_id: string
          name: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          name: string
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          name?: string
          order?: number
          created_at?: string
        }
      }
      labels: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          project_id: string
          section_id: string | null
          title: string
          description: string | null
          priority: 'p1' | 'p2' | 'p3' | 'p4'
          due_date: string | null
          recurrence: string | null
          status: 'todo' | 'in_progress' | 'done'
          completed: boolean
          completed_at: string | null
          order: number
          is_recurring_parent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          section_id?: string | null
          title: string
          description?: string | null
          priority?: 'p1' | 'p2' | 'p3' | 'p4'
          due_date?: string | null
          recurrence?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          completed?: boolean
          completed_at?: string | null
          order?: number
          is_recurring_parent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          section_id?: string | null
          title?: string
          description?: string | null
          priority?: 'p1' | 'p2' | 'p3' | 'p4'
          due_date?: string | null
          recurrence?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          completed?: boolean
          completed_at?: string | null
          order?: number
          is_recurring_parent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      task_labels: {
        Row: {
          task_id: string
          label_id: string
        }
        Insert: {
          task_id: string
          label_id: string
        }
        Update: {
          task_id?: string
          label_id?: string
        }
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          completed: boolean
          order: number
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          completed?: boolean
          order?: number
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          completed?: boolean
          order?: number
        }
      }
      comments: {
        Row: {
          id: string
          task_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          content?: string
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          task_id: string
          type: 'absolute' | 'relative'
          date_time: string | null
          relative_minutes: number | null
          is_triggered: boolean
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          type: 'absolute' | 'relative'
          date_time?: string | null
          relative_minutes?: number | null
          is_triggered?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          type?: 'absolute' | 'relative'
          date_time?: string | null
          relative_minutes?: number | null
          is_triggered?: boolean
          created_at?: string
        }
      }
      filters: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          query: string
          is_favorite: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          query: string
          is_favorite?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          query?: string
          is_favorite?: boolean
          created_at?: string
        }
      }
      karma_profiles: {
        Row: {
          user_id: string
          total_points: number
          level: number
          current_streak: number
          longest_streak: number
          daily_goal: number
          weekly_goal: number
          last_completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_points?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          daily_goal?: number
          weekly_goal?: number
          last_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_points?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          daily_goal?: number
          weekly_goal?: number
          last_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      karma_events: {
        Row: {
          id: string
          user_id: string
          points: number
          tasks_completed: number
          reason: string
          date: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          tasks_completed?: number
          reason: string
          date?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          tasks_completed?: number
          reason?: string
          date?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
