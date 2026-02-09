-- Side-by-side comparison results
create table if not exists public.comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_ids uuid[] not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.comparisons enable row level security;

create policy "comparisons: user can CRUD own" on public.comparisons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
