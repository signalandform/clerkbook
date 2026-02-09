'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  variant: 'library' | 'new';
};

export function OnboardingBanner({ variant }: Props) {
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/user-settings')
      .then((r) => r.json())
      .then((data) => setHasCompleted(data.has_completed_onboarding ?? false))
      .catch(() => setHasCompleted(true));
  }, []);

  if (hasCompleted !== false || dismissed) return null;

  return (
    <div className="rounded-lg border border-[var(--accent)] bg-[var(--bg-inset)] p-4">
      <p className="text-sm font-medium text-[var(--fg-default)]">
        Add your first URL to get started.
      </p>
      <p className="mt-1 text-sm text-[var(--fg-muted)]">
        Paste a URL below or use the Capture URL field. Citestack will extract and enrich it automatically.
      </p>
      {variant === 'library' && (
        <Link
          href="/new"
          className="mt-3 inline-block rounded bg-[var(--btn-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--btn-primary-hover)]"
        >
          Add URL
        </Link>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-2 text-sm text-[var(--fg-muted)] hover:text-[var(--fg-default)]"
      >
        Dismiss
      </button>
    </div>
  );
}

export function OnboardingHighlight() {
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const markComplete = useCallback(() => {
    setDismissed(true);
    fetch('/api/user-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ has_completed_onboarding: true }),
    });
  }, []);

  useEffect(() => {
    fetch('/api/user-settings')
      .then((r) => r.json())
      .then((data) => setHasCompleted(data.has_completed_onboarding ?? false))
      .catch(() => setHasCompleted(true));
  }, []);

  if (hasCompleted !== false || dismissed) return null;

  return (
    <div className="mt-3 rounded-lg border-2 border-[var(--accent)] bg-[var(--bg-inset)] p-3">
      <p className="text-sm font-medium text-[var(--fg-default)]">
        Try it: Copy + citation
      </p>
      <p className="mt-1 text-xs text-[var(--fg-muted)]">
        Use the Copy + citation button to copy quotes with the source attribution.
      </p>
      <button
        type="button"
        onClick={markComplete}
        className="mt-2 rounded bg-[var(--btn-primary)] px-2 py-1 text-xs font-medium text-white hover:bg-[var(--btn-primary-hover)]"
      >
        Got it
      </button>
    </div>
  );
}
