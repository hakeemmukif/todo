-- ============================================================================
-- FIX: Allow NULL project_id for Inbox tasks
-- ============================================================================
-- This migration makes project_id nullable to support Inbox functionality
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- Step 1: Make project_id nullable
ALTER TABLE tasks ALTER COLUMN project_id DROP NOT NULL;

-- Step 2: Update the check to ensure tasks without a project are valid
-- (Tasks can have null project_id, which represents Inbox)

-- Step 3: Add a comment to document this design decision
COMMENT ON COLUMN tasks.project_id IS 'Project ID - NULL represents Inbox tasks (virtual project view)';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this migration, you should be able to create tasks with NULL project_id
-- Test with: INSERT INTO tasks (user_id, project_id, title) VALUES (auth.uid(), NULL, 'Test Inbox Task');
-- ============================================================================
