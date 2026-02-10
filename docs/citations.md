# Citations

CiteStack supports formatted citations and export for saved items (URL, paste, file).

## How it works

- **Normalized metadata:** Citations use a single metadata model: title, authors, year, publisher/site, URL, DOI, and “accessed on” date. Item data is mapped into this model with fallbacks (e.g. domain as publisher, `created_at` for year when no publication date).
- **Styles:** APA 7, MLA 9, and Chicago (Notes/Bibliography — bibliography format) are generated with template-based formatters in `lib/citations/`.
- **Exports:** BibTeX (`.bib`), RIS (`.ris`), and CSL-JSON (`.json`) are built from the same normalized source so references stay consistent.

## Where it appears

- **Item detail page:** A “Cite” panel shows an “Accessed on” date (default today), formatted citations in APA, MLA, and Chicago, and a “Copy citation” button for each.
- **Library / collection view:** Multi-select items with checkboxes, then use the “Export” dropdown to download BibTeX, RIS, or CSL-JSON for the selected items.

## Data sourcing

- **URL items:** Uses extracted metadata when present (title, domain, author, published date). If missing, falls back to domain as title/site and `created_at` for year.
- **File/PDF items:** Uses extracted metadata if available; otherwise uses filename as title and “(n.d.)” for year. URL is included when known.
- **Paste items:** Title and year from item metadata; URL when not applicable.

## Known limitations

- Missing authors may appear as “Unknown” or be omitted depending on style.
- File items without a URL produce minimal publisher/URL output.
- “Accessed on” is set in the UI and sent per request; it can be stored per item later via the optional `accessed_at` column.
- Formatting is template-based (no Citation.js dependency); edge cases (e.g. special characters, very long fields) may need manual review.

## API

- **POST `/api/citations/formatted`** — Body: `{ itemId, accessedAt? }`. Returns `{ apa, mla, chicago }` for that item. Requires auth; only the current user’s items are allowed.
- **POST `/api/citations/export`** — Body: `{ format: 'bibtex' | 'ris' | 'csl-json', itemIds: string[], accessedAt? }`. Returns a file with `Content-Disposition: attachment`. Requires auth; only the current user’s items are allowed.

All citation APIs enforce user scoping (same pattern as `/api/items/[id]`).
