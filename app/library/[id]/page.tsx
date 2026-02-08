'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/app/components/app-shell';

type Item = {
  id: string;
  title: string | null;
  source_type: string;
  url: string | null;
  domain: string | null;
  status: string;
  raw_text: string | null;
  cleaned_text: string | null;
  original_filename: string | null;
  created_at: string;
  updated_at: string;
};

export default function ItemDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid item');
      setLoading(false);
      return;
    }

    fetch(`/api/items/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('notfound');
          throw new Error('Failed to load');
        }
        return res.json();
      })
      .then((data) => {
        setItem(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message === 'notfound' ? 'Item not found' : 'Could not load item');
        setItem(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <main className="mx-auto max-w-2xl p-6">
          <p className="text-sm text-gray-500">Loading…</p>
        </main>
      </AppShell>
    );
  }

  if (error && !item) {
    return (
      <AppShell>
        <main className="mx-auto max-w-2xl p-6">
          <p className="text-sm text-red-600">{error}</p>
          <p className="mt-4">
            <Link href="/library" className="text-sm text-gray-600 underline hover:text-gray-900">
              Back to Library
            </Link>
          </p>
        </main>
      </AppShell>
    );
  }

  if (!item) return null;

  const content = item.cleaned_text || item.raw_text;

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl p-6">
        <p className="mb-4">
          <Link href="/library" className="text-sm text-gray-600 underline hover:text-gray-900">
            Back to Library
          </Link>
        </p>

        <h1 className="text-xl font-semibold text-gray-900">
          {item.title || item.original_filename || item.domain || item.id.slice(0, 8) + '…'}
        </h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
          <span>{item.source_type}</span>
          <span>{item.status}</span>
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
          {item.updated_at && item.updated_at !== item.created_at && (
            <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 underline hover:text-gray-900"
            >
              Open URL
            </a>
          )}
          {item.original_filename && (
            <span>File: {item.original_filename}</span>
          )}
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-medium text-gray-700">Content</h2>
          <div className="mt-2 max-h-96 overflow-auto rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap">
            {content ? content : 'No content yet. Item may still be processing.'}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
