import Link from 'next/link';
import { getUser } from '@/lib/supabase/server';
import { LandingHeader } from '@/app/components/landing-header';

export default async function Home() {
  const user = await getUser();

  if (user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-[var(--fg-muted)]">Redirecting…</p>
        <Link className="mt-2 inline-block text-[var(--accent)] underline hover:no-underline" href="/library">
          Go to Library
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <LandingHeader />

      <section className="mt-12">
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--fg-default)]">
          Save, summarize, and cite your research in one place.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-[var(--fg-muted)]">
          Save URLs, paste text, or upload files. CiteStack extracts and enriches content automatically,
          so you build a searchable library of papers, articles, and notes — and cite with confidence.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/signup?ref=home"
            className="inline-flex items-center justify-center rounded-md bg-[var(--btn-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--btn-primary-hover)]"
          >
            Get started free
          </Link>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-2 text-sm font-medium text-[var(--fg-default)] hover:bg-[var(--bg-inset)]"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-2 text-xs text-[var(--fg-muted)]">
          Free tier • No credit card required
        </p>
      </section>

      <section className="mt-12 rounded-xl border border-[var(--border-default)] bg-[var(--bg-inset)] p-6">
        <h2 className="text-sm font-semibold text-[var(--fg-default)]">How it works</h2>
        <ol className="mt-3 grid gap-3 text-sm text-[var(--fg-muted)] sm:grid-cols-3">
          <li>
            <span className="font-medium text-[var(--fg-default)]">1) Save</span> URLs, paste, or upload
          </li>
          <li>
            <span className="font-medium text-[var(--fg-default)]">2) Extract & enrich</span> (quotes, tags, summary)
          </li>
          <li>
            <span className="font-medium text-[var(--fg-default)]">3) Search & cite</span> (copy citations, export)
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="sr-only">Benefits</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h3 className="text-sm font-semibold text-[var(--fg-default)]">Quote bank</h3>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Every source becomes quotable snippets with “why it matters” so you can write and cite with confidence.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h3 className="text-sm font-semibold text-[var(--fg-default)]">Citations & export</h3>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              APA / MLA / Chicago citations; export BibTeX, RIS, or CSL-JSON when you need to hand work in.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h3 className="text-sm font-semibold text-[var(--fg-default)]">Search across everything</h3>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Full-text search and filters (tags, domain, collections) so you find the exact quote you remember.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h3 className="text-sm font-semibold text-[var(--fg-default)]">URLs + PDFs</h3>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Save web pages, paste text, or upload files. CiteStack extracts and enriches them in the background.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
