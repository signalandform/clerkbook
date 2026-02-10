/**
 * Normalized citation source used by formatters and exporters.
 * Built from DB item row with fallbacks for missing metadata.
 */
export type CitationSource = {
  id: string;
  title: string;
  authors: string[];
  year: string; // 'YYYY' or 'n.d.'
  publisher: string | null;
  url: string | null;
  doi: string | null;
  accessedAt: string | null; // ISO date YYYY-MM-DD
  sourceType: 'url' | 'paste' | 'file';
};

export type ItemRowForCitation = {
  id: string;
  title: string | null;
  source_type: string;
  url: string | null;
  domain: string | null;
  original_filename: string | null;
  created_at: string;
  authors?: string[] | null;
  publisher?: string | null;
  published_at?: string | null;
  accessed_at?: string | null;
  doi?: string | null;
};

export type CitationSourceOptions = {
  accessedAt?: string | null; // ISO date; overrides item.accessed_at
};

function toYear(iso: string | null | undefined): string {
  if (!iso) return 'n.d.';
  const y = iso.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : 'n.d.';
}

function toAccessed(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

/**
 * Map a DB item row to a normalized citation source.
 * Uses fallbacks: title -> original_filename -> domain -> (Untitled); year from published_at or created_at.
 */
export function itemToCitationSource(
  row: ItemRowForCitation,
  options: CitationSourceOptions = {}
): CitationSource {
  const title =
    row.title?.trim() ||
    (row.source_type === 'file' && row.original_filename?.trim()) ||
    (row.source_type === 'url' && row.domain) ||
    '(Untitled)';

  const year = row.published_at
    ? toYear(row.published_at)
    : toYear(row.created_at);

  const publisher =
    row.publisher?.trim() ||
    (row.source_type === 'url' && row.domain) ||
    null;

  const authors = Array.isArray(row.authors) && row.authors.length > 0
    ? row.authors.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
    : [];

  const accessedAt =
    toAccessed(options.accessedAt) ??
    toAccessed(row.accessed_at) ??
    toAccessed(new Date().toISOString());

  return {
    id: row.id,
    title,
    authors,
    year,
    publisher,
    url: row.url?.trim() || null,
    doi: row.doi?.trim() || null,
    accessedAt,
    sourceType: row.source_type as 'url' | 'paste' | 'file',
  };
}
