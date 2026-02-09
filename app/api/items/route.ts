import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status')?.trim();
  const sourceType = url.searchParams.get('source_type')?.trim();
  const domain = url.searchParams.get('domain')?.trim();
  const tag = url.searchParams.get('tag')?.trim();

  const admin = supabaseAdmin();
  let query = admin
    .from('items')
    .select('id, title, source_type, domain, status, created_at, abstract, summary')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200);

  if (status && status !== 'all') {
    if (status === 'processing') {
      query = query.in('status', ['captured', 'extracted']);
    } else if (status === 'failed') {
      query = query.eq('status', 'failed');
    } else if (status === 'enriched') {
      query = query.eq('status', 'enriched');
    }
  }

  if (sourceType) {
    query = query.eq('source_type', sourceType);
  }

  if (domain) {
    query = query.ilike('domain', `%${domain}%`);
  }

  let { data: items, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Could not load items' },
      { status: 500 }
    );
  }

  let list = items ?? [];

  if (tag && list.length > 0) {
    const itemIds = list.map((i) => i.id);
    const { data: tagRows } = await admin
      .from('tags')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', tag)
      .maybeSingle();
    if (tagRows?.id) {
      const { data: itemTagRows } = await admin
        .from('item_tags')
        .select('item_id')
        .eq('tag_id', tagRows.id)
        .in('item_id', itemIds);
      const taggedIds = new Set((itemTagRows ?? []).map((r) => r.item_id));
      list = list.filter((i) => taggedIds.has(i.id));
    } else {
      list = [];
    }
  }

  if (list.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const itemIds = list.map((i) => i.id);
  const { data: itemTagRows } = await admin
    .from('item_tags')
    .select('item_id, tag_id')
    .in('item_id', itemIds);

  const tagIds = [...new Set((itemTagRows ?? []).map((r) => r.tag_id))];
  const tagMap = new Map<string, string[]>();

  if (tagIds.length > 0) {
    const { data: tags } = await admin
      .from('tags')
      .select('id, name')
      .eq('user_id', user.id)
      .in('id', tagIds);

    const tagIdToName = new Map((tags ?? []).map((t) => [t.id, t.name]));
    for (const row of itemTagRows ?? []) {
      const name = tagIdToName.get(row.tag_id);
      if (!name) continue;
      const arr = tagMap.get(row.item_id) ?? [];
      arr.push(name);
      tagMap.set(row.item_id, arr);
    }
  }

  const itemsWithTags = list.map((item) => ({
    ...item,
    tags: tagMap.get(item.id) ?? [],
  }));

  return NextResponse.json({ items: itemsWithTags });
}
