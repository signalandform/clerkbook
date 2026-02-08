'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function SignInForm() {
  const searchParams = useSearchParams();
  const _next = searchParams.get('next') || '/'; // for future redirect after sign-in
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/request-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, invite_code: inviteCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
        return;
      }
      setStatus('success');
      setMessage(data.message || 'Check your email for a magic link.');
    } catch {
      setStatus('error');
      setMessage('Network error');
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        Enter your email and invite code. We&apos;ll send you a magic link.
      </p>

      {status === 'success' ? (
        <div className="mt-6 rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="invite_code" className="block text-sm font-medium text-gray-700">
              Invite code
            </label>
            <input
              id="invite_code"
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          {message && status === 'error' && (
            <p className="text-sm text-red-600">{message}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-xs text-gray-500">
        <a href="/" className="underline">
          Back to home
        </a>
      </p>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md p-6"><p className="text-sm text-gray-500">Loading…</p></main>}>
      <SignInForm />
    </Suspense>
  );
}
