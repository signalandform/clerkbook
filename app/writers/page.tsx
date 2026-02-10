import Link from "next/link";
import { LandingHeader } from "@/app/components/landing-header";

export default function WritersLanding() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <LandingHeader />

      <section className="mt-12">
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--fg-default)]">
          Never lose a great quote again.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-[var(--fg-muted)]">
          CiteStack is a citation-first research library. Save URLs and PDFs and
          get a searchable quote bank—with “why it matters” and citations—so you
          can draft faster with receipts.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/new?ref=lp_writers"
            className="inline-flex items-center justify-center rounded-md bg-[var(--btn-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--btn-primary-hover)]"
          >
            Try it free
          </Link>
          <Link
            href="/library?ref=lp_writers"
            className="inline-flex items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-2 text-sm font-medium text-[var(--fg-default)] hover:bg-[var(--bg-inset)]"
          >
            View your library
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h2 className="text-sm font-semibold text-[var(--fg-default)]">Quote cards</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Pull 5–12 key quotes per source, each with context and a “why it
              matters” note you can actually use.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h2 className="text-sm font-semibold text-[var(--fg-default)]">Search + organize</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Full-text search, tags, domains, and collections make it easy to
              build a personal research database.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h2 className="text-sm font-semibold text-[var(--fg-default)]">Cite on demand</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Copy citations (APA/MLA/Chicago) and export to BibTeX/RIS/CSL-JSON
              when you need to publish or collaborate.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-inset)] p-5">
            <h2 className="text-sm font-semibold text-[var(--fg-default)]">Built for long reads</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              URLs, papers, and PDFs supported. Processing runs in the
              background, and your library stays searchable.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-[var(--border-default)] bg-[var(--bg-inset)] p-6">
        <h3 className="text-sm font-semibold text-[var(--fg-default)]">A simple workflow</h3>
        <ol className="mt-3 grid gap-3 text-sm text-[var(--fg-muted)] sm:grid-cols-3">
          <li>
            <span className="font-medium text-[var(--fg-default)]">1) Save</span> what you’re reading
          </li>
          <li>
            <span className="font-medium text-[var(--fg-default)]">2) Get quotes</span> + tags + summary
          </li>
          <li>
            <span className="font-medium text-[var(--fg-default)]">3) Write</span> with receipts
          </li>
        </ol>
      </section>

      <footer className="mt-12 border-t border-[var(--border-default)] pt-6 text-xs text-[var(--fg-muted)]">
        <p>
          Want the student-focused pitch? <Link className="text-[var(--accent)] underline hover:no-underline" href="/students">/students</Link>
        </p>
      </footer>
    </main>
  );
}
