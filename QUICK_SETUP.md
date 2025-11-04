# 🚀 QUICK SETUP INSTRUCTIONS

## Step 1: Set up your database

1. Open your Supabase dashboard: https://supabase.com/dashboard/project/qjyuoyzymatxzdvnhlvv
2. Go to "SQL Editor" in the left sidebar
3. Click "New Query"  
4. Copy and paste the entire content of `supabase_setup_complete.sql` file
5. Click "Run" to execute all the SQL commands

This will create:
- ✅ User profiles table
- ✅ Books table with all fields
- ✅ Exchanges table for transactions  
- ✅ Messages table for chat
- ✅ Gamification tables (user_stats, badges, user_badges)
- ✅ Security policies (RLS)
- ✅ Automatic triggers for XP and badges
- ✅ Performance indexes

## Step 2: Test the application

1. Your server is already running at: http://localhost:3000
2. Try to register a new account - it should work now!
3. The registration will:
   - Create your profile automatically
   - Initialize your gamification stats (Level 1, 0 XP)
   - Set up your user preferences

## Step 3: Explore the features

After registration, you can:
- 📚 List your first book (earn +10 XP and "First Steps" badge)
- 🎮 Check your dashboard to see gamification features
- 🔍 Browse the marketplace with smart recommendations
- 🗺️ Explore the campus map integration
- 📱 Try installing the PWA (look for install prompt)

## Your Supabase Project Info:
- **Project URL**: https://qjyuoyzymatxzdvnhlvv.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/qjyuoyzymatxzdvnhlvv
- **SQL Editor**: https://supabase.com/dashboard/project/qjyuoyzymatxzdvnhlvv/sql

## Troubleshooting:

If you get "Failed to fetch" errors:
1. Make sure you ran the SQL setup script completely
2. Check that your .env.local file has the correct credentials (✅ already done)
3. Restart the dev server: `npm run dev`

The app will automatically create your profile and stats when you first sign up!