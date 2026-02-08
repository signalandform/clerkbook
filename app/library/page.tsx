'use client';

import { useEffect, useState } from 'react';

type Item = {
  id: string;
  title: string | null;
  source_type: string;
  status: string;
  created_at: string;
};

export default function LibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/items')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((data) => setItems(data.items ?? []))
      .catch(() => setError('Could not load library'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold">Library</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your captured items. Status: captured → extracted → enriched.
      </p>

      {loading && <p className="mt-4 text-sm text-gray-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <ul className="mt-6 space-y-3">
          {items.length === 0 ? (
            <li className="text-sm text-gray-500">No items yet.</li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="rounded border border-gray-200 bg-gray-50 p-3 text-sm"
              >
                <div className="font-medium text-gray-900">
                  {item.title || item.id.slice(0, 8) + '…'}
                </div>
                <div className="mt-1 flex gap-2 text-xs text-gray-500">
                  <span>{item.source_type}</span>
                  <span>{item.status}</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      <p className="mt-8 text-xs text-gray-500">
        <a href="/" className="underline">Back to home</a>
      </p>
    </main>
  );
}
