-- QUICK FIX: Disable the karma profile trigger temporarily
-- This allows users to sign up without errors
-- We'll create karma profiles on-demand instead

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
