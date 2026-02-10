import Link from "next/link";

export default function WritersLanding() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          CiteStack
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="text-gray-600 hover:text-gray-900" href="/students">
            For students
          </Link>
          <Link className="text-gray-600 hover:text-gray-900" href="/library">
            Open app
          </Link>
        </nav>
      </header>

      <section className="mt-12">
        <h1 className="text-balance text-4xl font-semibold tracking-tight">
          Never lose a great quote again.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-gray-600">
          CiteStack is a citation-first research library. Save URLs and PDFs and
          get a searchable quote bank—with “why it matters” and citations—so you
          can draft faster with receipts.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/new?ref=lp_writers"
            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Try it free
          </Link>
          <Link
            href="/library?ref=lp_writers"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            View your library
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold">Quote cards</h2>
            <p className="mt-2 text-sm text-gray-600">
              Pull 5–12 key quotes per source, each with context and a “why it
              matters” note you can actually use.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold">Search + organize</h2>
            <p className="mt-2 text-sm text-gray-600">
              Full-text search, tags, domains, and collections make it easy to
              build a personal research database.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold">Cite on demand</h2>
            <p className="mt-2 text-sm text-gray-600">
              Copy citations (APA/MLA/Chicago) and export to BibTeX/RIS/CSL-JSON
              when you need to publish or collaborate.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold">Built for long reads</h2>
            <p className="mt-2 text-sm text-gray-600">
              URLs, papers, and PDFs supported. Processing runs in the
              background, and your library stays searchable.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-sm font-semibold">A simple workflow</h3>
        <ol className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
          <li>
            <span className="font-medium">1) Save</span> what you’re reading
          </li>
          <li>
            <span className="font-medium">2) Get quotes</span> + tags + summary
          </li>
          <li>
            <span className="font-medium">3) Write</span> with receipts
          </li>
        </ol>
      </section>

      <footer className="mt-12 border-t border-gray-200 pt-6 text-xs text-gray-500">
        <p>
          Want the student-focused pitch? <Link className="underline" href="/students">/students</Link>
        </p>
      </footer>
    </main>
  );
}
