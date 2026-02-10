import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enqueueEnrichItem } from '@/lib/jobs/enqueue-enrich';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { title?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const text = typeof body.text === 'string' ? body.text : '';
  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }
  const title = typeof body.title === 'string' ? body.title.trim() : undefined;

  const admin = supabaseAdmin();

  const { data: item, error: itemError } = await admin
    .from('items')
    .insert({
      user_id: user.id,
      source_type: 'paste',
      title: title || null,
      raw_text: text,
      cleaned_text: text,
      status: 'captured',
    })
    .select('id')
    .single();

  if (itemError || !item) {
    const message = itemError?.message ?? 'Unknown error';
    console.error('[capture/paste] items insert failed', { itemError, userId: user.id });
    return NextResponse.json(
      { error: 'Could not create item', details: message },
      { status: 500 }
    );
  }

  try {
    const result = await enqueueEnrichItem(admin, user.id, item.id);
    if ('error' in result && result.error === 'insufficient_credits') {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: `Need ${result.required} credits; you have ${result.balance}. Credits reset monthly.`,
          required: result.required,
          balance: result.balance,
        },
        { status: 402 }
      );
    }
    const jobId = 'jobId' in result ? result.jobId : undefined;
    return NextResponse.json(
      { itemId: item.id, jobId },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[capture/paste] enqueue failed', { err, itemId: item.id });
    return NextResponse.json(
      { error: 'Could not enqueue job', details: message },
      { status: 500 }
    );
  }
}
