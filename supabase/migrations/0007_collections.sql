-- Collections (lightweight projects)
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_items (
  collection_id uuid references public.collections(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  primary key (collection_id, item_id)
);

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

create policy "collections: user can CRUD own" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "collection_items: user can CRUD via collection ownership" on public.collection_items
  for all using (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id and c.user_id = auth.uid()
    )
  );
