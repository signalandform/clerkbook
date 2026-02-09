'use client';

import { computeCoverage, getCoverageExplanation, type ItemForCoverage } from '@/lib/coverage';

export function CoverageBadge({ item }: { item: ItemForCoverage }) {
  const level = computeCoverage(item);
  if (!level) return null;

  const explanation = getCoverageExplanation(level);

  const colorClass =
    level === 'Good'
      ? 'bg-[var(--success-muted)] text-[var(--success)]'
      : level === 'Partial'
        ? 'bg-[var(--draft-muted)] text-[var(--fg-muted)]'
        : 'bg-[var(--danger-muted)] text-[var(--danger)]';

  return (
    <span
      title={explanation}
      className={`rounded-md px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      Coverage: {level}
    </span>
  );
}
