import Link from 'next/link';
import { getUser } from '@/lib/supabase/server';

export default async function Home() {
  const user = await getUser();

  if (user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-gray-600">Redirecting…</p>
        <Link className="mt-2 inline-block underline" href="/library">
          Go to Library
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-semibold">Clerkbook</h1>
      <p className="mt-2 text-lg text-gray-600">
        Your citation-first research library.
      </p>

      <p className="mt-6 text-sm text-gray-700">
        Save URLs, paste text, or upload files. Clerkbook extracts and enriches content automatically,
        so you can build a searchable library of papers, articles, and notes — and cite with confidence.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-900">Use cases</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>
            <strong className="text-gray-800">Researchers:</strong> Save papers, articles, and web pages; keep everything in one place.
          </li>
          <li>
            <strong className="text-gray-800">Students:</strong> Collect sources for essays and projects; avoid scattered bookmarks.
          </li>
          <li>
            <strong className="text-gray-800">Writers:</strong> Build a reference library of quotes and ideas.
          </li>
          <li>
            <strong className="text-gray-800">Knowledge workers:</strong> Capture and organize reading material for later.
          </li>
        </ul>
      </section>

      <div className="mt-10 flex gap-4">
        <Link
          href="/signin"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
