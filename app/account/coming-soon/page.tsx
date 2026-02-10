import Link from 'next/link';
import { AppShell } from '@/app/components/app-shell';

export default function ComingSoonPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold text-[var(--fg-default)]">Billing & credits</h1>
        <div className="mt-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-6 text-center">
          <p className="text-lg font-medium text-[var(--fg-default)]">
            Increased capabilities coming soon.
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Upgrade plans and credit packs will be available here.
          </p>
          <Link
            href="/account"
            className="mt-4 inline-block rounded-md border border-[var(--border-default)] bg-[var(--bg-default)] px-3 py-2 text-sm font-medium text-[var(--fg-default)] hover:bg-[var(--draft-muted)]"
          >
            Back to Account
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
