-- Fix for karma profile creation trigger
-- This allows the trigger to bypass RLS when creating karma profiles for new users

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_karma_profile_for_new_user();

-- Recreate the function with proper permissions
CREATE OR REPLACE FUNCTION create_karma_profile_for_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.karma_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create karma profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_karma_profile_for_new_user();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_karma_profile_for_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION create_karma_profile_for_new_user() TO service_role;
