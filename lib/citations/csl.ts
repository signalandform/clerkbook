import type { CitationSource } from './types';

/**
 * Minimal CSL-JSON item shape (Citation Style Language).
 * Used for export and for potential Citation.js integration.
 */
export type CslItem = {
  id: string;
  type: 'article' | 'webpage' | 'document';
  title: string;
  author?: { family?: string; given?: string }[];
  issued?: { 'date-parts'?: number[][] };
  'container-title'?: string;
  URL?: string;
  DOI?: string;
  accessed?: { 'date-parts'?: number[][] };
};

function parseDateParts(iso: string | null): number[][] | undefined {
  if (!iso || iso.length < 10) return undefined;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (Number.isNaN(y)) return undefined;
  if (Number.isNaN(m) || Number.isNaN(d)) return [[y]];
  return [[y, m, d]];
}

function authorsToCsl(authors: string[]): { family?: string; given?: string }[] {
  return authors.map((a) => {
    const trimmed = a.trim();
    const comma = trimmed.indexOf(',');
    if (comma > 0) {
      return {
        family: trimmed.slice(0, comma).trim() || undefined,
        given: trimmed.slice(comma + 1).trim() || undefined,
      };
    }
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 0) {
      return {
        family: trimmed.slice(lastSpace + 1).trim() || undefined,
        given: trimmed.slice(0, lastSpace).trim() || undefined,
      };
    }
    return { family: trimmed || undefined };
  });
}

/**
 * Convert a citation source to a CSL-JSON item.
 */
export function sourceToCsl(source: CitationSource): CslItem {
  const type =
    source.sourceType === 'url' ? 'webpage' : source.sourceType === 'file' ? 'document' : 'article';
  const year = source.year !== 'n.d.' ? parseInt(source.year, 10) : undefined;
  const issued = year !== undefined ? { 'date-parts': [[year]] } : undefined;
  const accessed = source.accessedAt ? { 'date-parts': parseDateParts(source.accessedAt) ?? [] } : undefined;

  const item: CslItem = {
    id: source.id,
    type,
    title: source.title,
    issued,
    URL: source.url ?? undefined,
    DOI: source.doi ?? undefined,
    accessed,
  };

  if (source.publisher) item['container-title'] = source.publisher;
  if (source.authors.length > 0) item.author = authorsToCsl(source.authors);

  return item;
}
