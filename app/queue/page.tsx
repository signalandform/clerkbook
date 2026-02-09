'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/app/components/app-shell';
import { getItemDisplayTitle } from '@/lib/item-display';

type Job = {
  id: string;
  item_id: string | null;
  type: string;
  status: string;
  error: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  item_title: {
    title?: string | null;
    source_type: string;
    domain?: string | null;
    original_filename?: string | null;
  } | null;
};

function formatType(type: string): string {
  const map: Record<string, string> = {
    extract_url: 'Extract URL',
    extract_file: 'Extract file',
    enrich_item: 'Enrich',
  };
  return map[type] ?? type;
}

function statusClass(status: string): string {
  switch (status) {
    case 'queued':
      return 'rounded px-2 py-0.5 text-xs font-medium bg-[var(--fg-muted)]/20 text-[var(--fg-muted)]';
    case 'running':
      return 'rounded px-2 py-0.5 text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent)]';
    case 'succeeded':
      return 'rounded px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400';
    case 'failed':
      return 'rounded px-2 py-0.5 text-xs font-medium bg-[var(--danger)]/20 text-[var(--danger)]';
    default:
      return 'rounded px-2 py-0.5 text-xs font-medium bg-[var(--fg-muted)]/20 text-[var(--fg-muted)]';
  }
}

export default function QueuePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const hasActiveJobs = jobs.some((j) => j.status === 'queued' || j.status === 'running');
  useEffect(() => {
    if (!hasActiveJobs) return;
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, [hasActiveJobs, fetchJobs]);

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold text-[var(--fg-default)]">Process queue</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Jobs for extraction and enrichment. Queued and running jobs update automatically.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-[var(--fg-muted)]">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--fg-muted)]">No jobs yet.</p>
        ) : (
          <div className="mt-6 space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={statusClass(job.status)}>{job.status}</span>
                  <span className="text-sm text-[var(--fg-muted)]">
                    {formatType(job.type)}
                  </span>
                  {job.item_id && (
                    <Link
                      href={`/items/${job.item_id}`}
                      className="text-sm text-[var(--accent)] underline hover:no-underline"
                    >
                      {job.item_title
                        ? getItemDisplayTitle({
                            id: job.item_id,
                            title: job.item_title.title,
                            source_type: job.item_title.source_type,
                            domain: job.item_title.domain,
                            original_filename: job.item_title.original_filename,
                          })
                        : job.item_id.slice(0, 8) + '…'}
                    </Link>
                  )}
                </div>
                {job.error && (
                  <p className="mt-2 text-sm text-[var(--danger)]">{job.error}</p>
                )}
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Created {new Date(job.created_at).toLocaleString()}
                  {job.finished_at &&
                    ` · Finished ${new Date(job.finished_at).toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
