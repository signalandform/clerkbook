'use client';

import { useState } from 'react';
import { AppShell } from '@/app/components/app-shell';

export default function NewItemPage() {
  const [url, setUrl] = useState('');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [urlMessage, setUrlMessage] = useState('');

  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pasteMessage, setPasteMessage] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileStatus, setFileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fileMessage, setFileMessage] = useState('');

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUrlStatus('loading');
    setUrlMessage('');
    try {
      const res = await fetch('/api/capture/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUrlStatus('error');
        setUrlMessage(data.error || 'Failed');
        return;
      }
      setUrlStatus('success');
      setUrlMessage('Item created. Processing in background.');
      setUrl('');
    } catch {
      setUrlStatus('error');
      setUrlMessage('Network error');
    }
  }

  async function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasteStatus('loading');
    setPasteMessage('');
    try {
      const res = await fetch('/api/capture/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pasteTitle || undefined, text: pasteText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasteStatus('error');
        setPasteMessage(data.error || 'Failed');
        return;
      }
      setPasteStatus('success');
      setPasteMessage('Item created. Processing in background.');
      setPasteTitle('');
      setPasteText('');
    } catch {
      setPasteStatus('error');
      setPasteMessage('Network error');
    }
  }

  async function handleFileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFileMessage('Select a file');
      setFileStatus('error');
      return;
    }
    setFileStatus('loading');
    setFileMessage('');
    try {
      const form = new FormData();
      form.set('file', file);
      if (fileTitle) form.set('title', fileTitle);
      const res = await fetch('/api/capture/file', {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFileStatus('error');
        setFileMessage(data.error || 'Failed');
        return;
      }
      setFileStatus('success');
      setFileMessage('Item created. Processing in background.');
      setFile(null);
      setFileTitle('');
    } catch {
      setFileStatus('error');
      setFileMessage('Network error');
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-xl font-semibold">New item</h1>
        <p className="mt-2 text-sm text-gray-600">
          Save URLs, paste text, or upload documents (PDF, DOCX, TXT, MD). Each item is extracted and enriched automatically.
        </p>

        <section className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-medium text-gray-700">Capture URL</h2>
          <form onSubmit={handleUrlSubmit} className="mt-2 flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={urlStatus === 'loading'}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Capture URL
            </button>
          </form>
          {urlMessage && (
            <p className={`mt-1 text-sm ${urlStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {urlMessage}
            </p>
          )}
        </section>

        <section className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-medium text-gray-700">Capture paste</h2>
          <form onSubmit={handlePasteSubmit} className="mt-2 space-y-2">
            <input
              type="text"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste text..."
              required
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={pasteStatus === 'loading'}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Capture paste
            </button>
          </form>
          {pasteMessage && (
            <p className={`mt-1 text-sm ${pasteStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {pasteMessage}
            </p>
          )}
        </section>

        <section className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-medium text-gray-700">Capture file</h2>
          <form onSubmit={handleFileSubmit} className="mt-2 space-y-2">
            <input
              type="text"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium"
            />
            <button
              type="submit"
              disabled={fileStatus === 'loading' || !file}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Capture file
            </button>
          </form>
          {fileMessage && (
            <p className={`mt-1 text-sm ${fileStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {fileMessage}
            </p>
          )}
        </section>
      </main>
    </AppShell>
  );
}
