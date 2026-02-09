'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/library';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus('error');
        setMessage(error.message || 'Invalid login credentials');
        return;
      }
      router.push(next);
    } catch {
      setStatus('error');
      setMessage('Network error');
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold text-[var(--fg-default)]">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">
        Enter your email and password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--fg-default)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-default)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[var(--fg-default)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--fg-default)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--border-default)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[var(--fg-default)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        {message && status === 'error' && (
          <p className="text-sm text-[var(--danger)]">{message}</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded bg-[var(--btn-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
        >
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-xs text-[var(--fg-muted)]">
        Don&apos;t have an account? <a href="/signup" className="text-[var(--accent)] underline hover:no-underline">Sign up</a>
      </p>
      <p className="mt-2 text-xs text-[var(--fg-muted)]">
        <a href="/" className="text-[var(--accent)] underline hover:no-underline">
          Back to home
        </a>
      </p>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md p-6"><p className="text-sm text-[var(--fg-muted)]">Loading…</p></main>}>
      <SignInForm />
    </Suspense>
  );
}
