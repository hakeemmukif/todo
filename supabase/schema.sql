-- ============================================================================
-- DAILY TASK TRACKER - DATABASE SCHEMA FOR SUPABASE
-- ============================================================================
-- This schema is designed for PostgreSQL (Supabase)
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  view_style TEXT CHECK (view_style IN ('list', 'board')) DEFAULT 'list',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_order ON projects("order");

-- ============================================================================
-- SECTIONS TABLE
-- ============================================================================
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sections_project_id ON sections(project_id);
CREATE INDEX idx_sections_user_id ON sections(user_id);

-- ============================================================================
-- LABELS TABLE
-- ============================================================================
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_labels_user_id ON labels(user_id);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('p1', 'p2', 'p3', 'p4')) DEFAULT 'p4',
  due_date TIMESTAMPTZ,
  recurrence TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_recurring_parent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_section_id ON tasks(section_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- ============================================================================
-- TASK_LABELS (Junction Table for Many-to-Many)
-- ============================================================================
CREATE TABLE task_labels (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- Indexes
CREATE INDEX idx_task_labels_task_id ON task_labels(task_id);
CREATE INDEX idx_task_labels_label_id ON task_labels(label_id);

-- ============================================================================
-- SUBTASKS TABLE
-- ============================================================================
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Index
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_comments_task_id ON comments(task_id);

-- ============================================================================
-- REMINDERS TABLE
-- ============================================================================
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('absolute', 'relative')) NOT NULL,
  date_time TIMESTAMPTZ,
  relative_minutes INTEGER,
  is_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_reminders_task_id ON reminders(task_id);
CREATE INDEX idx_reminders_date_time ON reminders(date_time);

-- ============================================================================
-- FILTERS TABLE
-- ============================================================================
CREATE TABLE filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  query TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_filters_user_id ON filters(user_id);

-- ============================================================================
-- KARMA_PROFILES TABLE
-- ============================================================================
CREATE TABLE karma_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  daily_goal INTEGER DEFAULT 5,
  weekly_goal INTEGER DEFAULT 30,
  last_completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- KARMA_EVENTS TABLE (for points history)
-- ============================================================================
CREATE TABLE karma_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  tasks_completed INTEGER DEFAULT 1,
  reason TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_karma_events_user_id ON karma_events(user_id);
CREATE INDEX idx_karma_events_date ON karma_events(date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_events ENABLE ROW LEVEL SECURITY;

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Sections: Users can only access sections in their projects
CREATE POLICY "Users can view their own sections" ON sections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sections" ON sections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections" ON sections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections" ON sections
  FOR DELETE USING (auth.uid() = user_id);

-- Labels: Users can only access their own labels
CREATE POLICY "Users can view their own labels" ON labels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own labels" ON labels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own labels" ON labels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own labels" ON labels
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks: Users can only access their own tasks
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Task Labels: Users can only access task_labels for their own tasks
CREATE POLICY "Users can view their own task labels" ON task_labels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own task labels" ON task_labels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own task labels" ON task_labels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid()
    )
  );

-- Subtasks: Users can only access subtasks for their own tasks
CREATE POLICY "Users can view their own subtasks" ON subtasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own subtasks" ON subtasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own subtasks" ON subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own subtasks" ON subtasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
    )
  );

-- Comments: Users can only access comments for their own tasks
CREATE POLICY "Users can view their own comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = comments.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = comments.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = comments.task_id AND tasks.user_id = auth.uid()
    )
  );

-- Reminders: Users can only access reminders for their own tasks
CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = reminders.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own reminders" ON reminders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = reminders.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own reminders" ON reminders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = reminders.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reminders" ON reminders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = reminders.task_id AND tasks.user_id = auth.uid()
    )
  );

-- Filters: Users can only access their own filters
CREATE POLICY "Users can view their own filters" ON filters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own filters" ON filters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters" ON filters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters" ON filters
  FOR DELETE USING (auth.uid() = user_id);

-- Karma Profiles: Users can only access their own karma profile
CREATE POLICY "Users can view their own karma profile" ON karma_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own karma profile" ON karma_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own karma profile" ON karma_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Karma Events: Users can only access their own karma events
CREATE POLICY "Users can view their own karma events" ON karma_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own karma events" ON karma_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_karma_profiles_updated_at
  BEFORE UPDATE ON karma_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create karma profile for new users
CREATE OR REPLACE FUNCTION create_karma_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO karma_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create karma profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_karma_profile_for_new_user();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Most indexes are already created above, but here are additional composite indexes

CREATE INDEX idx_tasks_user_project ON tasks(user_id, project_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date) WHERE completed = false;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Schema created successfully!
-- Next steps:
-- 1. Copy this entire schema and run it in Supabase SQL Editor
-- 2. Verify all tables are created
-- 3. Get your Supabase URL and anon key from Settings > API
-- 4. Add them to your .env.local file
-- ============================================================================
