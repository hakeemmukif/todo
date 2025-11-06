-- ============================================================================
-- MIGRATION: Make project_id optional for inbox tasks
-- ============================================================================
-- This migration allows tasks to exist without a project (inbox tasks)
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- Make project_id nullable to support inbox tasks
ALTER TABLE tasks
ALTER COLUMN project_id DROP NOT NULL;

-- Update the foreign key constraint to allow NULL
-- (The existing constraint already allows NULL values once the column is nullable)

-- Add a comment explaining the change
COMMENT ON COLUMN tasks.project_id IS 'Project ID - NULL indicates task is in Inbox';
