-- ============================================================================
-- MIGRATION: Add Project Hierarchy and Calendar View Support
-- ============================================================================
-- This migration adds:
-- 1. Parent-child project relationships (parent_id)
-- 2. Calendar view option to view_style
-- 3. Constraints to prevent circular dependencies
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- Step 1: Add parent_id column for project hierarchy
ALTER TABLE projects
ADD COLUMN parent_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Step 2: Add index for faster parent-child queries
CREATE INDEX idx_projects_parent_id ON projects(parent_id);

-- Step 3: Update view_style constraint to include 'calendar'
-- First drop the old constraint
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_view_style_check;

-- Then add the new constraint with calendar support
ALTER TABLE projects
ADD CONSTRAINT projects_view_style_check
CHECK (view_style IN ('list', 'board', 'calendar'));

-- Step 4: Add constraint to prevent self-referencing (project can't be its own parent)
ALTER TABLE projects
ADD CONSTRAINT projects_no_self_parent
CHECK (parent_id IS NULL OR parent_id != id);

-- Step 5: Add comments to document the changes
COMMENT ON COLUMN projects.parent_id IS 'Parent project ID - NULL for top-level projects, enables project hierarchy';
COMMENT ON COLUMN projects.view_style IS 'Project view preference: list (default), board (kanban), or calendar';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- After running this migration, you can test with:
--
-- 1. Create a top-level project:
-- INSERT INTO projects (user_id, name, color, view_style)
-- VALUES (auth.uid(), 'Parent Project', '#dc4c3e', 'list');
--
-- 2. Create a child project:
-- INSERT INTO projects (user_id, name, color, parent_id, view_style)
-- VALUES (auth.uid(), 'Child Project', '#4caf50',
--         (SELECT id FROM projects WHERE name = 'Parent Project' LIMIT 1),
--         'board');
--
-- 3. Verify hierarchy:
-- SELECT p.name AS parent, c.name AS child, c.view_style
-- FROM projects p
-- LEFT JOIN projects c ON c.parent_id = p.id
-- WHERE p.user_id = auth.uid();
-- ============================================================================
