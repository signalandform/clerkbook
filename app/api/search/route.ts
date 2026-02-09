import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  if (!q) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const escaped = q.replace(/"/g, '""');
  const pattern = `"%${escaped}%"`;

  const admin = supabaseAdmin();
  const { data: items, error } = await admin
    .from('items')
    .select('id, title, source_type, summary, abstract, status, created_at')
    .eq('user_id', user.id)
    .or(`title.ilike.${pattern},summary.ilike.${pattern},abstract.ilike.${pattern}`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Could not search' }, { status: 500 });
  }

  const list = items ?? [];
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
