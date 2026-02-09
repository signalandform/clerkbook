-- Add generated column for coverage heuristic (avoids fetching full text in list views)
alter table public.items
  add column if not exists cleaned_text_length int generated always as (coalesce(length(cleaned_text), 0)) stored;
