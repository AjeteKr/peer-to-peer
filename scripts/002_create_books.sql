-- Create books table
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null,
  isbn text,
  description text,
  condition text not null check (condition in ('new', 'like_new', 'good', 'acceptable', 'poor')),
  category text not null,
  price decimal(10, 2),
  listing_type text not null check (listing_type in ('sell', 'exchange', 'donate')),
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.books enable row level security;

-- RLS Policies for books
create policy "Anyone can view available books"
  on public.books for select
  using (true);

create policy "Users can insert their own books"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own books"
  on public.books for update
  using (auth.uid() = user_id);

create policy "Users can delete their own books"
  on public.books for delete
  using (auth.uid() = user_id);

-- Create index for better query performance
create index if not exists books_user_id_idx on public.books(user_id);
create index if not exists books_status_idx on public.books(status);
create index if not exists books_category_idx on public.books(category);
create index if not exists books_listing_type_idx on public.books(listing_type);
