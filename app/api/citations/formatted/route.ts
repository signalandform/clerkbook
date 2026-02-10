import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { itemToCitationSource, formatBibliography, type ItemRowForCitation } from '@/lib/citations';

const CITATION_COLUMNS =
  'id, title, source_type, url, domain, original_filename, created_at, authors, publisher, published_at, accessed_at, doi';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { itemId?: string; accessedAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const itemId = typeof body.itemId === 'string' ? body.itemId.trim() : '';
  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  const accessedAt =
    typeof body.accessedAt === 'string' && body.accessedAt.trim()
      ? body.accessedAt.trim().slice(0, 10)
      : undefined;

  const admin = supabaseAdmin();
  const { data: item, error } = await admin
    .from('items')
    .select(CITATION_COLUMNS)
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();

  if (error || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const source = itemToCitationSource(item as ItemRowForCitation, {
    accessedAt,
  });

  const apa = formatBibliography(source, 'apa');
  const mla = formatBibliography(source, 'mla');
  const chicago = formatBibliography(source, 'chicago');

  return NextResponse.json({ apa, mla, chicago });
}
