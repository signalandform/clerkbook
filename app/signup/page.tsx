'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setStatus('error');
        setMessage(error.message || 'Something went wrong');
        return;
      }
      if (data.session) {
        router.push('/library');
        return;
      }
      setStatus('success');
      setMessage('Check your email to confirm your account.');
    } catch {
      setStatus('error');
      setMessage('Network error');
    }
  }

  if (status === 'success') {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <div className="mt-6 rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {message}
        </div>
        <p className="mt-6 text-xs text-gray-500">
          <a href="/signin" className="underline">Sign in</a>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Sign up</h1>
      <p className="mt-2 text-sm text-gray-600">
        Create an account with your email and password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="confirm_password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {status === 'loading' ? 'Signing up…' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-xs text-gray-500">
        Already have an account? <a href="/signin" className="underline">Sign in</a>
      </p>
      <p className="mt-2 text-xs text-gray-500">
        <a href="/" className="underline">
          Back to home
        </a>
      </p>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md p-6"><p className="text-sm text-gray-500">Loading…</p></main>}>
      <SignUpForm />
    </Suspense>
  );
}
