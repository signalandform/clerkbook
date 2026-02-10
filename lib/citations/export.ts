import type { CitationSource } from './types';
import { sourceToCsl } from './csl';

function escapeBibTeX(s: string): string {
  return s.replace(/[{\\]/g, (c) => '\\' + c).replace(/\n/g, ' ');
}

function bibTeXKey(source: CitationSource, index: number): string {
  const base = source.authors[0]
    ? source.authors[0].replace(/\s+/g, '').slice(0, 20)
    : 'item';
  const year = source.year !== 'n.d.' ? source.year : '';
  return `${base}${year}${index}`;
}

/**
 * Export items as BibTeX (.bib).
 */
export function exportBibTeX(sources: CitationSource[]): string {
  const entries = sources.map((s, i) => {
    const type = s.sourceType === 'url' ? 'misc' : 'article';
    const key = bibTeXKey(s, i);
    const title = escapeBibTeX(s.title);
    const author = s.authors.length > 0 ? s.authors.join(' and ') : 'Unknown';
    const year = s.year !== 'n.d.' ? s.year : '';
    const parts = [
      `  author = {${escapeBibTeX(author)}}`,
      `  title = {${title}}`,
      `  year = {${year}}`,
    ];
    if (s.url) parts.push(`  url = {${s.url}}`);
    if (s.doi) parts.push(`  doi = {${s.doi}}`);
    if (s.accessedAt) parts.push(`  note = {Accessed ${s.accessedAt}}`);
    return `@${type}{${key},\n${parts.join(',\n')}\n}`;
  });
  return entries.join('\n\n') + '\n';
}

function escapeRIS(s: string): string {
  return s.replace(/\r?\n/g, ' ').trim();
}

/**
 * Export items as RIS (.ris).
 */
export function exportRIS(sources: CitationSource[]): string {
  const blocks = sources.map((s) => {
    const lines: string[] = [
      'TY  - GEN',
      'TI  - ' + escapeRIS(s.title),
      'PY  - ' + (s.year !== 'n.d.' ? s.year : ''),
      'UR  - ' + (s.url || ''),
    ];
    if (s.authors.length > 0) {
      s.authors.forEach((a) => lines.push('AU  - ' + escapeRIS(a)));
    }
    if (s.publisher) lines.push('PB  - ' + escapeRIS(s.publisher));
    if (s.doi) lines.push('DO  - ' + escapeRIS(s.doi));
    if (s.accessedAt) lines.push('Y2  - ' + escapeRIS(s.accessedAt));
    lines.push('ER  - ');
    return lines.join('\n');
  });
  return blocks.join('\n');
}

/**
 * Export items as CSL-JSON (.json).
 */
export function exportCSLJSON(sources: CitationSource[]): string {
  const items = sources.map(sourceToCsl);
  return JSON.stringify(items, null, 2);
}
