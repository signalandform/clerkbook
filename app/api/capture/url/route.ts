import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const url = typeof body.url === 'string' ? body.url.trim() : '';
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: item, error: itemError } = await admin
    .from('items')
    .insert({
      user_id: user.id,
      source_type: 'url',
      url,
      status: 'captured',
    })
    .select('id')
    .single();

  if (itemError || !item) {
    return NextResponse.json(
      { error: 'Could not create item' },
      { status: 500 }
    );
  }

  const { data: job, error: jobError } = await admin
    .from('jobs')
    .insert({
      user_id: user.id,
      item_id: item.id,
      type: 'extract_url',
      payload: { itemId: item.id, url },
      status: 'queued',
    })
    .select('id')
    .single();

  if (jobError) {
    return NextResponse.json(
      { error: 'Could not enqueue job' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { itemId: item.id, jobId: job?.id },
    { status: 201 }
  );
}
