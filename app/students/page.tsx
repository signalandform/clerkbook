import Link from "next/link";

export default function StudentsLanding() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          CiteStack
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="text-gray-600 hover:text-gray-900" href="/writers">
            For writers
          </Link>
          <Link className="text-gray-600 hover:text-gray-900" href="/library">
            Open app
          </Link>
        </nav>
      </header>

      <section className="mt-12">
        <h1 className="text-balance text-4xl font-semibold tracking-tight">
          Turn sources into cite-ready notes.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-gray-600">
          Save a URL or PDF. CiteStack extracts the text, pulls key quotes, and
          generates citations—so essays and projects go faster and your receipts
          are always attached.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/new?ref=lp_students"
            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Try it free
          </Link>
          <Link
            href="/library?ref=lp_students"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            View your library
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold">Quote bank (with context)</h2>
            <p className="mt-2 text-sm text-gray-600">
              Every source becomes a set of quotable snippets with “why it
              matters” so you can write and cite with confidence.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold">Citations + exports</h2>
            <p className="mt-2 text-sm text-gray-600">
              Generate APA / MLA / Chicago citations and export BibTeX, RIS, or
              CSL-JSON when you need to hand work in.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold">Search across everything</h2>
            <p className="mt-2 text-sm text-gray-600">
              Full-text search and filters (tags, domain, collections) make it
              easy to find the exact quote you remember.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold">Works with URLs + PDFs</h2>
            <p className="mt-2 text-sm text-gray-600">
              Save web pages, paste text, or upload files. CiteStack extracts and
              enriches them in the background.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-sm font-semibold">How it works</h3>
        <ol className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
          <li>
            <span className="font-medium">1) Save</span> a URL or PDF
          </li>
          <li>
            <span className="font-medium">2) Extract + enrich</span> (quotes,
            tags, summary)
          </li>
          <li>
            <span className="font-medium">3) Cite</span> (copy citations,
            export)
          </li>
        </ol>
      </section>

      <footer className="mt-12 border-t border-gray-200 pt-6 text-xs text-gray-500">
        <p>
          Want the writer-focused pitch? <Link className="underline" href="/writers">/writers</Link>
        </p>
      </footer>
    </main>
  );
}
