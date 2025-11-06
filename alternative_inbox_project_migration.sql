-- ============================================================================
-- ALTERNATIVE FIX: Create system Inbox project for each user
-- ============================================================================
-- This approach maintains NOT NULL constraint by creating a physical Inbox project
-- Only use this if you want strict referential integrity
-- ============================================================================

-- Step 1: Create a function to initialize Inbox project for new users
CREATE OR REPLACE FUNCTION create_inbox_project_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO projects (user_id, name, color, "order", is_favorite)
  VALUES (
    NEW.id,
    'Inbox',
    '#808080',
    -1, -- Negative order to keep it at the top
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger to auto-create Inbox on user signup
CREATE TRIGGER create_inbox_on_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_inbox_project_for_user();

-- Step 3: Create Inbox projects for existing users (if any)
INSERT INTO projects (user_id, name, color, "order", is_favorite)
SELECT
  u.id,
  'Inbox',
  '#808080',
  -1,
  false
FROM auth.users u
LEFT JOIN projects p ON p.user_id = u.id AND p.name = 'Inbox'
WHERE p.id IS NULL; -- Only create if doesn't exist

-- ============================================================================
-- NOTE: If using this approach, you'll need to update the frontend code to:
-- 1. Get the Inbox project ID instead of using null
-- 2. Filter out Inbox from regular project lists in the UI
-- 3. Update syncService.ts to NOT filter out Inbox projects
-- ============================================================================
