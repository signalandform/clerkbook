-- RLS hardening: scope policies to authenticated, lock down idempotency_keys, secure invite tables.

-- 1) Enable RLS on invite tables (no policies => client access denied by default)
alter table public.invite_codes enable row level security;
alter table public.invite_redemptions enable row level security;

-- 2) Replace public-scoped policies with authenticated-scoped policies

-- items
drop policy if exists "items: user can CRUD own" on public.items;
create policy "items: user can CRUD own"
on public.items
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- collections
drop policy if exists "collections: user can CRUD own" on public.collections;
create policy "collections: user can CRUD own"
on public.collections
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- collection_items (via collection ownership)
drop policy if exists "collection_items: user can CRUD via collection ownership" on public.collection_items;
create policy "collection_items: user can CRUD via collection ownership"
on public.collection_items
for all
to authenticated
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_items.collection_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.collections c
    where c.id = collection_items.collection_id
      and c.user_id = auth.uid()
  )
);

-- comparisons
drop policy if exists "comparisons: user can CRUD own" on public.comparisons;
create policy "comparisons: user can CRUD own"
on public.comparisons
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- embeddings
drop policy if exists "embeddings: user can CRUD own" on public.embeddings;
create policy "embeddings: user can CRUD own"
on public.embeddings
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- item_tags (via item ownership)
drop policy if exists "item_tags: user can CRUD via item ownership" on public.item_tags;
create policy "item_tags: user can CRUD via item ownership"
on public.item_tags
for all
to authenticated
using (
  exists (
    select 1
    from public.items i
    where i.id = item_tags.item_id
      and i.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.items i
    where i.id = item_tags.item_id
      and i.user_id = auth.uid()
  )
);

-- jobs
drop policy if exists "jobs: user can CRUD own" on public.jobs;
create policy "jobs: user can CRUD own"
on public.jobs
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- quotes
drop policy if exists "quotes: user can CRUD own" on public.quotes;
create policy "quotes: user can CRUD own"
on public.quotes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- tags
drop policy if exists "tags: user can CRUD own" on public.tags;
create policy "tags: user can CRUD own"
on public.tags
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- user_settings
drop policy if exists "user_settings: user can CRUD own" on public.user_settings;
create policy "user_settings: user can CRUD own"
on public.user_settings
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- credits tables: select-only
drop policy if exists "user_credits: user can select own" on public.user_credits;
create policy "user_credits: user can select own"
on public.user_credits
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "credit_ledger: user can select own" on public.credit_ledger;
create policy "credit_ledger: user can select own"
on public.credit_ledger
for select
to authenticated
using (auth.uid() = user_id);

-- 3) Idempotency keys: select + insert only
drop policy if exists "idempotency_keys: user can select and insert own" on public.idempotency_keys;

create policy "idempotency_keys: user can select own"
on public.idempotency_keys
for select
to authenticated
using (auth.uid() = user_id);

create policy "idempotency_keys: user can insert own"
on public.idempotency_keys
for insert
to authenticated
with check (auth.uid() = user_id);