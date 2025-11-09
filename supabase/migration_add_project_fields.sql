-- ============================================================================
-- MIGRATION: Add missing fields to projects table
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 1. Add icon column (optional, deprecated but kept for backward compatibility)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS icon TEXT;

-- 2. Add parent_id column for project hierarchy
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- 3. Add is_archived column
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;

-- 4. Update view_style constraint to include 'calendar'
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_view_style_check;

ALTER TABLE projects
ADD CONSTRAINT projects_view_style_check
CHECK (view_style IN ('list', 'board', 'calendar'));

-- 5. Create index for parent_id for faster hierarchy queries
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);

-- 6. Create index for is_archived for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_is_archived ON projects(is_archived);

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- The projects table now supports:
-- - icon (optional, for backward compatibility)
-- - parent_id (for project hierarchies)
-- - is_archived (for archiving projects)
-- - view_style (now includes 'calendar' option)
-- ============================================================================
