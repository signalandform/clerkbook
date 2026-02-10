import Link from "next/link";
import { LandingHeader } from "@/app/components/landing-header";

export default function StudentsLanding() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <LandingHeader />

      <section className="mt-12">
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--fg-default)]">
          Turn sources into cite-ready notes.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-[var(--fg-muted)]">
          Save a URL or PDF. CiteStack extracts the text, pulls key quotes, and
          generates citations—so essays and projects go faster and your receipts
          are always attached.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/new?ref=lp_students"
            className="inline-flex items-center justify-center rounded-md bg-[var(--btn-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--btn-primary-hover)]"
          >
            Try it free
          </Link>
          <Link
            href="/library?ref=lp_students"
            className="inline-flex items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-2 text-sm font-medium text-[var(--fg-default)] hover:bg-[var(--bg-inset)]"
          >
            View your library
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h2 className="text-sm font-semibold text-[var(--fg-default)]">Quote bank (with context)</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Every source becomes a set of quotable snippets with “why it
              matters” so you can write and cite with confidence.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h2 className="text-sm font-semibold text-[var(--fg-default)]">Citations + exports</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Generate APA / MLA / Chicago citations and export BibTeX, RIS, or
              CSL-JSON when you need to hand work in.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h2 className="text-sm font-semibold text-[var(--fg-default)]">Search across everything</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Full-text search and filters (tags, domain, collections) make it
              easy to find the exact quote you remember.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h2 className="text-sm font-semibold text-[var(--fg-default)]">Works with URLs + PDFs</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Save web pages, paste text, or upload files. CiteStack extracts and
              enriches them in the background.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-[var(--border-default)] bg-[var(--bg-inset)] p-6">
        <h3 className="text-sm font-semibold text-[var(--fg-default)]">How it works</h3>
        <ol className="mt-3 grid gap-3 text-sm text-[var(--fg-muted)] sm:grid-cols-3">
          <li>
            <span className="font-medium text-[var(--fg-default)]">1) Save</span> a URL or PDF
          </li>
          <li>
            <span className="font-medium text-[var(--fg-default)]">2) Extract + enrich</span> (quotes,
            tags, summary)
          </li>
          <li>
            <span className="font-medium text-[var(--fg-default)]">3) Cite</span> (copy citations,
            export)
          </li>
        </ol>
      </section>

      <footer className="mt-12 border-t border-[var(--border-default)] pt-6 text-xs text-[var(--fg-muted)]">
        <p>
          Want the writer-focused pitch? <Link className="text-[var(--accent)] underline hover:no-underline" href="/writers">/writers</Link>
        </p>
      </footer>
    </main>
  );
}
