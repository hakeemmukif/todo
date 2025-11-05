-- Clean up automatically created projects (Inbox is a view, not a project)
-- Run this once to remove any unwanted projects

DELETE FROM projects WHERE LOWER(name) IN ('inbox', 'personal');
