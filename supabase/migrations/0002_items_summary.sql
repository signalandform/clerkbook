-- Add summary column for enrichment output (abstract + bullets)
alter table public.items
  add column if not exists summary text;
