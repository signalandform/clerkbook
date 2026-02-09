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
  const limit = Math.min(
    Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10)),
    100
  );

  const admin = supabaseAdmin();
  let query = admin
    .from('jobs')
    .select(`
      id,
      item_id,
      type,
      status,
      error,
      created_at,
      started_at,
      finished_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status && ['queued', 'running', 'succeeded', 'failed'].includes(status)) {
    query = query.eq('status', status);
  }

  const { data: jobs, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Could not load jobs' },
      { status: 500 }
    );
  }

  const itemIds = [...new Set((jobs ?? []).map((j) => j.item_id).filter(Boolean))];
  let itemsMap: Record<string, { title?: string | null; source_type: string; domain?: string | null; original_filename?: string | null }> = {};

  if (itemIds.length > 0) {
    const { data: items } = await admin
      .from('items')
      .select('id, title, source_type, domain, original_filename')
      .in('id', itemIds);
    itemsMap = Object.fromEntries(
      (items ?? []).map((i) => [i.id, i])
    );
  }

  const jobsWithItem = (jobs ?? []).map((j) => ({
    ...j,
    item_title: j.item_id ? itemsMap[j.item_id] : null,
  }));

  return NextResponse.json({ jobs: jobsWithItem });
}
