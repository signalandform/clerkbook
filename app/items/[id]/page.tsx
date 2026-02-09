'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/app/components/app-shell';

type Quote = { id: string; quote: string; why_it_matters: string | null };
type Item = {
  id: string;
  title: string | null;
  source_type: string;
  url: string | null;
  domain: string | null;
  status: string;
  abstract: string | null;
  bullets: string[] | null;
  summary: string | null;
  error: string | null;
  raw_text: string | null;
  cleaned_text: string | null;
  original_filename: string | null;
  created_at: string;
  updated_at: string;
  quotes: Quote[];
  tags: string[];
};

export default function ItemDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItem = useCallback(() => {
    if (!id) return;
    fetch(`/api/items/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('notfound');
          throw new Error('Failed to load');
        }
        return res.json();
      })
      .then((data) => {
        setItem(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message === 'notfound' ? 'Item not found' : 'Could not load item');
        setItem(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError('Invalid item');
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchItem();
  }, [id, fetchItem]);

  async function handleRetry() {
    if (!id || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/items/${id}/retry`, { method: 'POST' });
      await res.json();
      fetchItem();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReEnrich() {
    if (!id || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/items/${id}/re-enrich`, { method: 'POST' });
      await res.json();
      fetchItem();
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <main className="mx-auto max-w-2xl p-6">
          <p className="text-sm text-[var(--fg-muted)]">Loading…</p>
        </main>
      </AppShell>
    );
  }

  if (error && !item) {
    return (
      <AppShell>
        <main className="mx-auto max-w-2xl p-6">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <p className="mt-4">
            <Link href="/library" className="text-sm text-[var(--accent)] underline hover:no-underline">
              Back to Library
            </Link>
          </p>
        </main>
      </AppShell>
    );
  }

  if (!item) return null;

  const content = item.cleaned_text || item.raw_text;

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl p-6">
        <p className="mb-4">
          <Link href="/library" className="text-sm text-[var(--accent)] underline hover:no-underline">
            Back to Library
          </Link>
        </p>

        <h1 className="text-xl font-semibold text-[var(--fg-default)]">
          {item.title || item.original_filename || item.domain || item.id.slice(0, 8) + '…'}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              item.status === 'failed'
                ? 'bg-[var(--danger-muted)] text-[var(--danger)]'
                : item.status === 'enriched'
                  ? 'bg-[var(--success-muted)] text-[var(--success)]'
                  : 'bg-[var(--draft-muted)] text-[var(--fg-muted)]'
            }`}
          >
            {item.status}
          </span>
          <span className="text-[var(--fg-muted)]">{item.source_type}</span>
          <span className="text-[var(--fg-muted)]">{new Date(item.created_at).toLocaleDateString()}</span>
          {item.updated_at && item.updated_at !== item.created_at && (
            <span className="text-[var(--fg-muted)]">Updated {new Date(item.updated_at).toLocaleDateString()}</span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline hover:no-underline"
            >
              Open URL
            </a>
          )}
          {item.original_filename && (
            <span className="text-[var(--fg-muted)]">File: {item.original_filename}</span>
          )}
        </div>

        {item.status === 'failed' && item.error && (
          <div className="mt-6 rounded-lg border border-[var(--border-default)] bg-[var(--danger-muted)] p-4 text-sm text-[var(--danger)]">
            <p className="font-medium">Error</p>
            <p className="mt-1">{item.error}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleRetry}
                disabled={actionLoading}
                className="rounded bg-[var(--btn-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={handleReEnrich}
                disabled={actionLoading}
                className="rounded border border-[var(--border-default)] bg-[var(--bg-default)] px-3 py-1.5 text-xs font-medium text-[var(--fg-default)] hover:bg-[var(--bg-inset)] disabled:opacity-50"
              >
                Re-enrich
              </button>
            </div>
          </div>
        )}

        {(item.abstract || (item.bullets && item.bullets.length > 0)) ? (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-[var(--fg-default)]">Summary</h2>
            <div className="mt-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-4 text-sm text-[var(--fg-default)]">
              {item.abstract && <p className="mb-3">{item.abstract}</p>}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="list-disc list-inside space-y-1">
                  {item.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : item.status === 'enriched' && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-[var(--fg-default)]">Summary</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">Not enriched yet.</p>
          </section>
        )}

        {item.quotes && item.quotes.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-[var(--fg-default)]">Quotes</h2>
            <ul className="mt-2 space-y-3">
              {item.quotes.map((q) => (
                <li key={q.id} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-3 text-sm">
                  <blockquote className="text-[var(--fg-default)]">&ldquo;{q.quote}&rdquo;</blockquote>
                  {q.why_it_matters && (
                    <p className="mt-1 text-[var(--fg-muted)]">{q.why_it_matters}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {item.tags && item.tags.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-[var(--fg-default)]">Tags</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[var(--draft-muted)] px-2 py-0.5 text-xs text-[var(--fg-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-sm font-medium text-[var(--fg-default)]">Content</h2>
          <div className="mt-2 max-h-96 overflow-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-4 text-sm text-[var(--fg-default)] whitespace-pre-wrap">
            {content ? content : 'No content yet. Item may still be processing.'}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
