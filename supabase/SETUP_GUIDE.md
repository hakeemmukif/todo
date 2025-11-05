# Supabase Setup Guide

Complete guide to set up Supabase database for the Daily Task Tracker app.

## Prerequisites

- Node.js and npm installed
- A Supabase account (free tier is sufficient)

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: Daily Task Tracker (or your preferred name)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (500MB database, unlimited API requests)
4. Click "Create new project"
5. Wait 2-3 minutes for project to be provisioned

## Step 2: Run Database Schema

1. Once project is ready, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the file `/supabase/schema.sql` in this repository
4. Copy the entire contents of `schema.sql`
5. Paste it into the SQL Editor
6. Click "Run" button (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" message
8. Verify tables were created:
   - Click "Table Editor" in left sidebar
   - You should see all tables: projects, tasks, labels, filters, etc.

## Step 3: Get API Credentials

1. Click on "Settings" (gear icon) in left sidebar
2. Click on "API" under Project Settings
3. You'll see two important values:
   - **Project URL**: looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: long string starting with `eyJ...`
4. Keep this page open for the next step

## Step 4: Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Add the following content (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ENABLE_OFFLINE_MODE=true
```

3. Save the file
4. **IMPORTANT**: Never commit `.env.local` to git (it's already in .gitignore)

## Step 5: Install Dependencies

The Supabase client library should already be installed. If not:

```bash
npm install @supabase/supabase-js
```

## Step 6: Test the Connection

1. Start the development server:
```bash
npm run dev
```

2. Open the browser console (F12)
3. You should NOT see any Supabase connection errors
4. If you see "Missing Supabase environment variables" error, check your `.env.local` file

## Step 7: Enable Email Authentication

1. In Supabase dashboard, go to "Authentication" > "Providers"
2. Email provider should already be enabled by default
3. For development, you can disable email confirmations:
   - Go to "Authentication" > "Settings"
   - Under "Email Auth", toggle "Enable email confirmations" to OFF
   - This allows instant sign-up during development

## Step 8: (Optional) Add Magic Link Authentication

If you want passwordless login:

1. In "Authentication" > "Providers"
2. Enable "Email" provider
3. Magic links will be sent automatically when users sign in

## Step 9: Test User Registration

1. In your app, try to register a new user
2. Go to Supabase dashboard > "Authentication" > "Users"
3. You should see your test user listed
4. Check "Table Editor" > "karma_profiles" - a profile should be auto-created

## Verification Checklist

- [ ] All tables created successfully in Supabase
- [ ] Row Level Security (RLS) is enabled on all tables
- [ ] .env.local file created with correct credentials
- [ ] App connects to Supabase without errors
- [ ] User can register and sign in
- [ ] Karma profile auto-created for new users

## Database Schema Overview

### Tables Created:
- `projects` - User projects/categories
- `sections` - Project sections for organization
- `tasks` - Main tasks table with all task data
- `labels` - Custom labels for categorization
- `task_labels` - Many-to-many junction table
- `subtasks` - Sub-tasks within tasks
- `comments` - Task comments
- `reminders` - Task reminders
- `filters` - Custom filter queries
- `karma_profiles` - User karma/gamification data
- `karma_events` - History of karma points earned

### Security Features:
- Row-Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic user_id filtering via auth.uid()
- Related data (subtasks, comments) secured via parent task ownership

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check that `.env.local` exists in project root
- Verify variable names start with `VITE_`
- Restart dev server after creating `.env.local`

### Error: "Failed to fetch"
- Check Supabase project URL is correct
- Verify project is active in Supabase dashboard
- Check internet connection

### Error: "JWT expired" or "Invalid token"
- Sign out and sign in again
- Clear browser localStorage
- Check that anon key is correct (not service role key)

### Tables not created
- Check SQL Editor for error messages
- Ensure entire schema.sql was pasted
- Verify you have permissions to create tables

### Users can see other users' data
- Verify RLS policies are enabled (check schema.sql)
- Run `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;` for affected tables

## Cost Information

### Free Tier Includes:
- 500MB database storage (~10,000+ users with tasks)
- Unlimited API requests
- Unlimited authentication users
- 2GB bandwidth per month
- 7 days of log retention

### When to Upgrade:
- Database exceeds 500MB ($25/month for 8GB)
- Need more than 2GB bandwidth
- Want automatic daily backups
- Need longer log retention

### Cost Optimization Tips:
- Images/files should be stored externally (Cloudinary, etc.)
- Clean up old completed tasks periodically
- Archive old karma_events data

## Next Steps

After Supabase is set up:
1. Test user registration and login
2. Create your first project
3. Add some tasks
4. Verify real-time sync works across browser tabs
5. Test offline mode (if enabled)

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: [Your GitHub issues page]
