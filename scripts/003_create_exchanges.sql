-- Create exchanges table for tracking book transactions
create table if not exists public.exchanges (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.exchanges enable row level security;

-- RLS Policies for exchanges
create policy "Users can view their own exchanges"
  on public.exchanges for select
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

create policy "Users can create exchange requests"
  on public.exchanges for insert
  with check (auth.uid() = buyer_id);

create policy "Sellers can update exchange status"
  on public.exchanges for update
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

create policy "Users can delete their own exchange requests"
  on public.exchanges for delete
  using (auth.uid() = buyer_id);

-- Create indexes
create index if not exists exchanges_book_id_idx on public.exchanges(book_id);
create index if not exists exchanges_seller_id_idx on public.exchanges(seller_id);
create index if not exists exchanges_buyer_id_idx on public.exchanges(buyer_id);
