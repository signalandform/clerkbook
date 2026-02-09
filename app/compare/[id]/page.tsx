'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/app/components/app-shell';
import { useToast } from '@/app/contexts/toast';

type CompareResult = {
  common_themes: string[];
  differences: string[];
  best_quotes_by_theme: {
    theme: string;
    quotes: { quote: string; item_id: string; item_title: string }[];
  }[];
};

type Comparison = {
  id: string;
  item_ids: string[];
  result: CompareResult;
  created_at: string;
};

export default function ComparePage() {
  const params = useParams();
  const id = params?.id as string;
  const { showToast } = useToast();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(() => {
    if (!id) return;
    fetch(`/api/compare/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(setComparison)
      .catch(() => setError('Could not load comparison'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  function copyWithCitation(quote: string, itemTitle: string) {
    const citation = `(Source: ${itemTitle})`;
    const text = `"${quote}"\n${citation}`;
    navigator.clipboard.writeText(text).then(
      () => showToast('Copied with citation', 'success'),
      () => showToast('Copy failed', 'error')
    );
  }

  if (loading) {
    return (
      <AppShell>
        <main className="mx-auto max-w-2xl p-6">
          <p className="text-sm text-[var(--fg-muted)]">Loading comparison…</p>
        </main>
      </AppShell>
    );
  }

  if (error || !comparison) {
    return (
      <AppShell>
        <main className="mx-auto max-w-2xl p-6">
          <p className="text-sm text-[var(--danger)]">{error ?? 'Comparison not found'}</p>
          <p className="mt-4">
            <Link href="/library" className="text-sm text-[var(--accent)] underline hover:no-underline">
              Back to Library
            </Link>
          </p>
        </main>
      </AppShell>
    );
  }

  const result = comparison.result as CompareResult;

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl p-6">
        <p className="mb-4">
          <Link href="/library" className="text-sm text-[var(--accent)] underline hover:no-underline">
            Back to Library
          </Link>
        </p>

        <h1 className="text-xl font-semibold text-[var(--fg-default)]">Comparison</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          {comparison.item_ids.length} items compared — {new Date(comparison.created_at).toLocaleString()}
        </p>

        {result.common_themes && result.common_themes.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-[var(--fg-default)]">Common themes</h2>
            <ul className="mt-2 space-y-1">
              {result.common_themes.map((theme, i) => (
                <li key={i} className="text-sm text-[var(--fg-default)]">
                  • {theme}
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.differences && result.differences.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-[var(--fg-default)]">Differences / contradictions</h2>
            <ul className="mt-2 space-y-1">
              {result.differences.map((diff, i) => (
                <li key={i} className="text-sm text-[var(--fg-default)]">
                  • {diff}
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.best_quotes_by_theme && result.best_quotes_by_theme.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-[var(--fg-default)]">Best quotes by theme</h2>
            <div className="mt-3 space-y-4">
              {result.best_quotes_by_theme.map((block, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-3"
                >
                  <p className="text-xs font-medium text-[var(--fg-muted)]">{block.theme}</p>
                  <ul className="mt-2 space-y-2">
                    {block.quotes?.map((q, j) => (
                      <li key={j} className="flex items-start justify-between gap-2 text-sm">
                        <blockquote className="flex-1 text-[var(--fg-default)]">
                          &ldquo;{q.quote}&rdquo; — <span className="text-[var(--fg-muted)]">{q.item_title}</span>
                        </blockquote>
                        <button
                          type="button"
                          onClick={() => copyWithCitation(q.quote, q.item_title)}
                          className="shrink-0 rounded border border-[var(--border-default)] bg-[var(--bg-default)] px-2 py-0.5 text-xs text-[var(--fg-muted)] hover:bg-[var(--bg-inset)]"
                        >
                          Copy + citation
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </AppShell>
  );
}
