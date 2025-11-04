# 🚀 BookSwap - Creative Peer-to-Peer Book Exchange Setup Guide

## 📱 What's New - Creative Features Added!

Your BookSwap platform now includes amazing new features:

### ✨ Gamification System
- **Level & XP System** - Users gain experience and level up
- **Badge System** - Unlock achievements like "Eco Warrior", "Speed Exchanger"
- **Reputation Score** - Build trust through successful exchanges
- **Streak Counter** - Daily login streaks with animations
- **Progress Tracking** - Visual progress bars and statistics

### 🎨 Modern UI/UX
- **Framer Motion Animations** - Smooth transitions and micro-interactions
- **Enhanced Book Cards** - Interactive overlays with like/share/view actions
- **Creative Dashboard** - Tabbed interface with smart recommendations
- **Gradient Designs** - Modern gradient backgrounds and effects

### 🤖 Smart Features  
- **AI Recommendations** - Personalized book suggestions
- **Campus Map Integration** - Find meetup spots and nearby books
- **Trending Books** - Discover popular and recently added content
- **Real-time Notifications** - PWA push notifications

### 📱 Progressive Web App (PWA)
- **Offline Support** - Works without internet connection
- **Install Prompts** - Native app-like experience
- **Background Sync** - Syncs data when back online
- **App Shortcuts** - Quick access to key features

---

## 🛠️ Setup Instructions

### 1. **Supabase Configuration** (Required)

To get your BookSwap platform working with real data, you need to set up Supabase:

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project (free tier available)
3. Go to Settings → API in your Supabase dashboard
4. Copy your Project URL and Anon Key
5. Create a `.env.local` file in your project root:

```env
# Replace with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **Database Setup**

Run the SQL scripts in the `scripts/` folder in your Supabase SQL editor:

1. `001_create_profiles.sql` - User profiles
2. `002_create_books.sql` - Book listings  
3. `003_create_exchanges.sql` - Exchange requests
4. `004_create_messages.sql` - Messaging system

### 3. **Gamification Tables** (New!)

Add these tables for the gamification system:

```sql
-- User Stats Table
CREATE TABLE user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  level integer default 1,
  experience integer default 0,
  books_shared integer default 0,
  books_received integer default 0,
  reputation_score decimal(3,2) default 0.0,
  streak_days integer default 0,
  total_saved_money integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Badges Table
CREATE TABLE badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  rarity text check (rarity in ('common', 'rare', 'epic', 'legendary'))
);

-- User Badges Table
CREATE TABLE user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  badge_id text references badges(id),
  unlocked_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, badge_id)
);
```

### 4. **PWA Icons** (Optional)

Add these icon files to your `public/` folder for full PWA support:
- `icon-72.png`
- `icon-96.png`  
- `icon-128.png`
- `icon-144.png`
- `icon-152.png`
- `icon-192.png`
- `icon-384.png`
- `icon-512.png`

---

## 🎮 How to Use the New Features

### **Dashboard**
- Visit `/dashboard` to see your gamified profile
- Check your level, XP, badges, and streak counter
- Browse personalized recommendations
- View the campus map for meetup locations

### **Gamification**
- Gain XP by listing books (+10 XP)
- Complete exchanges for bonus XP (+25 XP)  
- Donate books for good karma (+15 XP)
- Build streaks by logging in daily (+5 XP)

### **Smart Recommendations**
- Get AI-powered book suggestions based on your activity
- Discover trending books in your university
- Find recently added books from other students

### **PWA Features**
- Install the app on your phone/desktop
- Works offline with cached content
- Get push notifications for new messages
- Use app shortcuts for quick actions

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:3000` to see your enhanced BookSwap platform!

---

## 🎨 Customization

### **Colors & Theme**
Edit `app/globals.css` to customize colors and themes.

### **Gamification Rules**
Modify `lib/gamification.ts` to change XP rules and badge requirements.

### **Campus Locations**  
Update `components/campus-map.tsx` with your university's specific locations.

---

## 📞 Support

If you need help with setup or customization, the code is well-documented and modular. Each component is designed to work independently, making it easy to modify or extend.

Enjoy your creative, gamified BookSwap platform! 🚀📚