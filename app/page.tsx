import Link from 'next/link';
import { getUser } from '@/lib/supabase/server';

export default async function Home() {
  const user = await getUser();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Clerkbook</h1>
      <p className="mt-2 text-sm text-gray-600">
        Citation-first research library (save → summarize → search → cite).
      </p>

      <div className="mt-6 space-y-3">
        {user ? (
          <>
            <Link className="underline" href="/new">
              New item
            </Link>
            <br />
            <Link className="underline" href="/library">
              Library
            </Link>
          </>
        ) : (
          <Link className="underline" href="/signin">
            Sign in
          </Link>
        )}
      </div>
    </main>
  );
}
