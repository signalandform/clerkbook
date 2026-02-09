'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/app/components/app-shell';

type Item = {
  id: string;
  title: string | null;
  source_type: string;
  domain?: string | null;
  status: string;
  created_at: string;
  abstract?: string | null;
  summary?: string | null;
  tags?: string[];
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function buildParams(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const tagFromUrl = searchParams.get('tag') ?? undefined;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const debouncedQuery = useDebounce(searchQuery.trim(), 300);
  const debouncedDomain = useDebounce(domainFilter.trim(), 300);

  const tagFilter = tagFromUrl || undefined;

  const fetchUrl = useMemo(() => {
    const base = debouncedQuery ? '/api/search' : '/api/items';
    const params: Record<string, string> = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter) params.source_type = typeFilter;
    if (debouncedDomain) params.domain = debouncedDomain;
    if (tagFilter) params.tag = tagFilter;
    return `${base}${buildParams(params)}`;
  }, [debouncedQuery, statusFilter, typeFilter, debouncedDomain, tagFilter]);

  const fetchItems = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(debouncedQuery ? 'Failed to search' : 'Failed to load');
        return res.json();
      })
      .then((data) => setItems(data.items ?? []))
      .catch(() => setError(debouncedQuery ? 'Could not search' : 'Could not load library'))
      .finally(() => setLoading(false));
  }, [fetchUrl, debouncedQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-xl font-semibold text-[var(--fg-default)]">Library</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Your captured items. Add content from New item. Each item is processed in the background: captured → extracted → enriched.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <input
            type="search"
            placeholder="Search by title or summary…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[var(--fg-default)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-[var(--border-default)] bg-[var(--control-bg)] px-2 py-1.5 text-sm text-[var(--fg-default)]"
            >
              <option value="">Status: All</option>
              <option value="processing">Processing</option>
              <option value="enriched">Enriched</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-[var(--border-default)] bg-[var(--control-bg)] px-2 py-1.5 text-sm text-[var(--fg-default)]"
            >
              <option value="">Type: All</option>
              <option value="url">URL</option>
              <option value="paste">Paste</option>
              <option value="file">File</option>
            </select>
            <input
              type="text"
              placeholder="Domain…"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-28 rounded-md border border-[var(--border-default)] bg-[var(--control-bg)] px-2 py-1.5 text-sm text-[var(--fg-default)] placeholder:text-[var(--fg-muted)]"
            />
            {tagFilter && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--draft-muted)] pl-2 pr-1 py-0.5 text-xs text-[var(--fg-muted)]">
                Tag: {tagFilter}
                <Link
                  href="/library"
                  className="rounded p-0.5 hover:bg-[var(--bg-inset)]"
                  aria-label="Clear tag filter"
                >
                  ×
                </Link>
              </span>
            )}
          </div>
        </div>

        {loading && <p className="mt-4 text-sm text-[var(--fg-muted)]">Loading…</p>}
        {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="mt-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-4 text-sm text-[var(--fg-muted)]">
            {debouncedQuery
              ? 'No matching items.'
              : <>No items yet. <Link href="/new" className="font-medium text-[var(--accent)] underline hover:no-underline">Go to New item</Link> to add your first URL, paste, or file.</>}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="mt-6 space-y-3">
            {items.map((item) => {
              const snippet = (item.abstract ?? item.summary ?? '').trim();
              const snippetDisplay = snippet
                ? snippet.length > 150
                  ? snippet.slice(0, 150).trim() + '…'
                  : snippet
                : null;

              return (
                <li key={item.id}>
                  <Link
                    href={`/items/${item.id}`}
                    className="block rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-3 text-sm transition-colors hover:border-[var(--border-default)] hover:bg-[var(--draft-muted)]"
                  >
                    <div className="font-medium text-[var(--fg-default)]">
                      {item.title || item.id.slice(0, 8) + '…'}
                    </div>
                    {snippetDisplay && (
                      <p className="mt-1 text-[var(--fg-muted)]">{snippetDisplay}</p>
                    )}
                    {item.status !== 'enriched' && !snippetDisplay && (
                      <p className="mt-1 text-xs text-[var(--fg-muted)] opacity-70">Processing…</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.tags && item.tags.length > 0 && (
                        <span className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-[var(--draft-muted)] px-1.5 py-0.5 text-xs text-[var(--fg-muted)]"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 5 && (
                            <span className="text-xs text-[var(--fg-muted)] opacity-70">+{item.tags.length - 5}</span>
                          )}
                        </span>
                      )}
                      <span className="flex gap-2 text-xs text-[var(--fg-muted)]">
                        <span>{item.source_type}</span>
                        <span>{item.status}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </AppShell>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <main className="mx-auto max-w-2xl p-6">
          <h1 className="text-xl font-semibold text-[var(--fg-default)]">Library</h1>
          <p className="mt-4 text-sm text-[var(--fg-muted)]">Loading…</p>
        </main>
      </AppShell>
    }>
      <LibraryContent />
    </Suspense>
  );
}
