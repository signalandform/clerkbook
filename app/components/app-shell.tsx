'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div>
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
          <Link href="/library" className="text-sm font-semibold text-gray-900">
            Clerkbook
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/library" className="text-sm text-gray-600 hover:text-gray-900">
              Library
            </Link>
            <Link href="/new" className="text-sm text-gray-600 hover:text-gray-900">
              New item
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
