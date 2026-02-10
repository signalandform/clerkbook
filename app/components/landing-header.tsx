'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/app/contexts/theme';

export function LandingHeader() {
  const { effectiveTheme } = useTheme();

  return (
    <header className="flex items-center justify-between gap-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-[var(--fg-default)] hover:opacity-80"
      >
        <Image
          src={effectiveTheme === 'dark' ? '/logowhite.png' : '/logo.png'}
          alt="Citestack"
          width={28}
          height={28}
          className="shrink-0"
        />
        <span className="text-sm font-semibold tracking-tight">Citestack</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link
          className="text-[var(--fg-muted)] hover:text-[var(--fg-default)]"
          href="/writers"
        >
          For writers
        </Link>
        <Link
          className="text-[var(--fg-muted)] hover:text-[var(--fg-default)]"
          href="/students"
        >
          For students
        </Link>
        <Link
          className="text-[var(--fg-muted)] hover:text-[var(--fg-default)]"
          href="/library"
        >
          Open app
        </Link>
      </nav>
    </header>
  );
}
