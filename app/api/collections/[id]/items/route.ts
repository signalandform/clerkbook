import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: collectionId } = await params;

  let body: { itemId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const itemId = typeof body.itemId === 'string' ? body.itemId.trim() : '';
  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: collection } = await admin
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .single();

  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  const { data: item } = await admin
    .from('items')
    .select('id')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const { error } = await admin.from('collection_items').upsert(
    { collection_id: collectionId, item_id: itemId },
    { onConflict: 'collection_id,item_id' }
  );

  if (error) {
    return NextResponse.json({ error: 'Could not add item to collection' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: collectionId } = await params;
  const url = new URL(request.url);
  const itemId = url.searchParams.get('itemId')?.trim();

  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: collection } = await admin
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .single();

  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  const { error } = await admin
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('item_id', itemId);

  if (error) {
    return NextResponse.json({ error: 'Could not remove item from collection' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
