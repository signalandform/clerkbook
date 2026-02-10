-- Store image URLs extracted from URL items (img src from page).
alter table public.items add column if not exists image_urls text[];
