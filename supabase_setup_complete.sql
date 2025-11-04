-- ===============================================
-- BOOKSWAP DATABASE SETUP - RUN THIS IN SUPABASE SQL EDITOR
-- ===============================================

-- 1. CREATE PROFILES TABLE
-- ===============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  university text,
  student_id text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. CREATE BOOKS TABLE
-- ===============================================
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  author text not null,
  isbn text,
  description text,
  condition text check (condition in ('new', 'like_new', 'good', 'acceptable', 'poor')) not null,
  category text not null,
  price decimal(10,2),
  listing_type text check (listing_type in ('sell', 'exchange', 'donate')) not null,
  status text check (status in ('available', 'reserved', 'sold')) default 'available',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for books
alter table public.books enable row level security;

-- RLS Policies for books
create policy "Users can view all available books"
  on public.books for select
  using (status = 'available' or user_id = auth.uid());

create policy "Users can insert their own books"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own books"
  on public.books for update
  using (auth.uid() = user_id);

create policy "Users can delete their own books"
  on public.books for delete
  using (auth.uid() = user_id);

-- 3. CREATE EXCHANGES TABLE
-- ===============================================
create table if not exists public.exchanges (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete cascade not null,
  seller_id uuid references auth.users(id) on delete cascade not null,
  buyer_id uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')) default 'pending',
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for exchanges
alter table public.exchanges enable row level security;

-- RLS Policies for exchanges
create policy "Users can view their own exchanges"
  on public.exchanges for select
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

create policy "Users can create exchanges"
  on public.exchanges for insert
  with check (auth.uid() = buyer_id);

create policy "Sellers can update exchange status"
  on public.exchanges for update
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

-- 4. CREATE MESSAGES TABLE
-- ===============================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid references public.exchanges(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for messages
alter table public.messages enable row level security;

-- RLS Policies for messages
create policy "Users can view messages in their exchanges"
  on public.messages for select
  using (
    exchange_id in (
      select id from public.exchanges 
      where seller_id = auth.uid() or buyer_id = auth.uid()
    )
  );

create policy "Users can send messages in their exchanges"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exchange_id in (
      select id from public.exchanges 
      where seller_id = auth.uid() or buyer_id = auth.uid()
    )
  );

-- 5. GAMIFICATION TABLES (NEW!)
-- ===============================================

-- User Stats Table
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  level integer default 1,
  experience integer default 0,
  books_shared integer default 0,
  books_received integer default 0,
  reputation_score decimal(3,2) default 0.0,
  streak_days integer default 0,
  total_saved_money integer default 0,
  last_login_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for user_stats
alter table public.user_stats enable row level security;

create policy "Users can view all user stats"
  on public.user_stats for select
  using (true);

create policy "Users can update their own stats"
  on public.user_stats for update
  using (auth.uid() = user_id);

create policy "Users can insert their own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

-- Badges Table
create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  rarity text check (rarity in ('common', 'rare', 'epic', 'legendary')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for badges
alter table public.badges enable row level security;

create policy "Everyone can view badges"
  on public.badges for select
  using (true);

-- User Badges Table
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_id text references public.badges(id) on delete cascade not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

-- Enable RLS for user_badges
alter table public.user_badges enable row level security;

create policy "Users can view all user badges"
  on public.user_badges for select
  using (true);

create policy "Users can earn badges"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

-- 6. INSERT DEFAULT BADGES
-- ===============================================
insert into public.badges (id, name, description, icon, rarity) values
  ('first_share', 'First Steps', 'Listed your first book', '📚', 'common'),
  ('generous_giver', 'Generous Giver', 'Donated 5 books for free', '💝', 'rare'),
  ('book_hunter', 'Book Hunter', 'Successfully exchanged 10 books', '🎯', 'epic'),
  ('eco_warrior', 'Eco Warrior', 'Saved 50+ books from waste', '🌱', 'legendary'),
  ('speed_exchanger', 'Speed Exchanger', 'Completed exchange within 24 hours', '⚡', 'rare'),
  ('social_butterfly', 'Social Butterfly', 'Connected with 20+ students', '🦋', 'epic'),
  ('bookworm', 'Bookworm', 'Listed 25+ books', '🐛', 'rare'),
  ('helpful_student', 'Helpful Student', 'Helped 10+ students find books', '🤝', 'epic'),
  ('early_bird', 'Early Bird', 'One of the first 100 users', '🐦', 'legendary'),
  ('streak_master', 'Streak Master', 'Maintained 30-day login streak', '🔥', 'epic')
on conflict (id) do nothing;

-- 7. CREATE TRIGGER FUNCTIONS
-- ===============================================

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  
  -- Create user stats
  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  
  return new;
end;
$$;

-- Create trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update user stats when books are created
create or replace function public.update_user_stats_on_book_create()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Update books_shared count
  update public.user_stats 
  set 
    books_shared = books_shared + 1,
    experience = experience + 10,
    updated_at = now()
  where user_id = new.user_id;
  
  -- Award first share badge
  insert into public.user_badges (user_id, badge_id)
  values (new.user_id, 'first_share')
  on conflict (user_id, badge_id) do nothing;
  
  return new;
end;
$$;

-- Create trigger for book creation
drop trigger if exists on_book_created on public.books;
create trigger on_book_created
  after insert on public.books
  for each row execute procedure public.update_user_stats_on_book_create();

-- 8. CREATE INDEXES FOR PERFORMANCE
-- ===============================================
create index if not exists idx_books_user_id on public.books(user_id);
create index if not exists idx_books_status on public.books(status);
create index if not exists idx_books_category on public.books(category);
create index if not exists idx_books_listing_type on public.books(listing_type);
create index if not exists idx_books_created_at on public.books(created_at desc);

create index if not exists idx_exchanges_seller_id on public.exchanges(seller_id);
create index if not exists idx_exchanges_buyer_id on public.exchanges(buyer_id);
create index if not exists idx_exchanges_status on public.exchanges(status);

create index if not exists idx_messages_exchange_id on public.messages(exchange_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);

create index if not exists idx_user_stats_user_id on public.user_stats(user_id);
create index if not exists idx_user_badges_user_id on public.user_badges(user_id);

-- ===============================================
-- SETUP COMPLETE! 
-- Your BookSwap database is ready for use!
-- ===============================================