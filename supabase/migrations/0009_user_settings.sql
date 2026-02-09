-- User settings (onboarding, etc.)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  has_completed_onboarding boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings: user can CRUD own" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
