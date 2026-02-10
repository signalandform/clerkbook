'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Sidebar } from './sidebar';

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]')) return;

      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        router.push('/new');
      }
      if (e.key === '/' && pathname === '/library') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[type="search"]');
        input?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, pathname]);

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden
        />
      )}
      <Suspense fallback={<aside className="w-[200px] shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-inset)]" />}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex shrink-0 items-center border-b border-[var(--border-default)] bg-[var(--bg-default)] px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-[var(--fg-muted)] hover:bg-[var(--draft-muted)] hover:text-[var(--fg-default)]"
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
