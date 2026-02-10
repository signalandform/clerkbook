-- Citation metadata for APA/MLA/Chicago and exports (authors, publisher, dates, doi).
alter table public.items
  add column if not exists authors text[],
  add column if not exists publisher text,
  add column if not exists published_at timestamptz,
  add column if not exists accessed_at date,
  add column if not exists doi text;
