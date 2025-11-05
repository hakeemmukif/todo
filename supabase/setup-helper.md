# Supabase Setup Checklist

Use this checklist to track your setup progress.

## Step 1: Create Account ☐
- [ ] Go to https://app.supabase.com
- [ ] Sign up (GitHub or email)
- [ ] Verify email if using email signup

## Step 2: Create Project ☐
- [ ] Click "New Project" button
- [ ] Fill in project details:
  - **Organization**: Create new or select existing
  - **Name**: `daily-task-tracker` (or your preferred name)
  - **Database Password**: (save this securely!)
  - **Region**: Choose closest to you:
    - `us-east-1` (Virginia) - East Coast US
    - `us-west-1` (N. California) - West Coast US
    - `eu-west-1` (Ireland) - Europe
    - `ap-southeast-1` (Singapore) - Asia
  - **Pricing Plan**: Free
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for provisioning

## Step 3: Run Database Schema ☐
- [ ] Click "SQL Editor" in left sidebar
- [ ] Click "+ New query" button
- [ ] Copy entire contents of `/supabase/schema.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run" (or press Cmd/Ctrl + Enter)
- [ ] Verify success message: "Success. No rows returned"

## Step 4: Verify Tables Created ☐
- [ ] Click "Table Editor" in left sidebar
- [ ] Verify these tables exist:
  - [ ] projects
  - [ ] sections
  - [ ] tasks
  - [ ] task_labels
  - [ ] subtasks
  - [ ] comments
  - [ ] reminders
  - [ ] labels
  - [ ] filters
  - [ ] karma_profiles
  - [ ] karma_events

## Step 5: Get API Credentials ☐
- [ ] Click "Settings" (gear icon) in left sidebar
- [ ] Click "API" under Project Settings
- [ ] Copy these values (you'll need them next):
  - [ ] **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
  - [ ] **anon/public key**: Long string starting with `eyJ...`

## Step 6: Configure Environment Variables ☐
- [ ] Open terminal in project root
- [ ] Run: `cp .env.example .env.local`
- [ ] Edit `.env.local` with your values:
  ```env
  VITE_SUPABASE_URL=<paste your Project URL>
  VITE_SUPABASE_ANON_KEY=<paste your anon key>
  VITE_ENABLE_OFFLINE_MODE=true
  ```
- [ ] Save the file

## Step 7: Test Connection ☐
- [ ] Run: `npm run dev`
- [ ] Open browser to `http://localhost:5173`
- [ ] Open browser console (F12)
- [ ] Verify NO Supabase errors appear

## Common Issues

### "Missing Supabase environment variables"
- Make sure `.env.local` is in project root (not in /supabase folder)
- Make sure variable names have `VITE_` prefix
- Restart dev server after creating `.env.local`

### "Failed to fetch"
- Check Project URL is correct (should include https://)
- Verify project is "Active" in Supabase dashboard
- Check your internet connection

### Tables not showing up
- Make sure you ran the ENTIRE schema.sql file
- Check SQL Editor for any error messages in red
- Verify you're looking at the correct project

## Ready to Test!

Once all steps are complete:
1. You should be able to start the dev server
2. No Supabase errors in console
3. Ready to implement authentication next

---

**Your Credentials** (keep these secure):
```
Project URL: ___________________________________
Anon Key: _____________________________________
Database Password: _____________________________
```
