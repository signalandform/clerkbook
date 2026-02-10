-- Billing & Usage: plan column, ledger comparison_id, metadata default.

alter table public.user_credits
  add column if not exists plan text not null default 'free';

comment on column public.user_credits.plan is 'free|pro|power';

update public.user_credits set plan = 'free' where plan is null;

alter table public.credit_ledger
  add column if not exists comparison_id uuid;

alter table public.credit_ledger
  alter column metadata set default '{}'::jsonb;
