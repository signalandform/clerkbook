-- Store extracted contact info (emails, phones, addresses, usernames+platforms).
alter table public.items add column if not exists contacts jsonb;
