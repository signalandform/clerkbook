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

  const { id: itemId } = await params;
  let body: { tag?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const tagName = String(body.tag ?? '').trim().toLowerCase().slice(0, 100);
  if (!tagName) {
    return NextResponse.json({ error: 'Tag name required' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: item, error: itemErr } = await admin
    .from('items')
    .select('id, user_id')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();

  if (itemErr || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const { data: existingTag } = await admin
    .from('tags')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', tagName)
    .maybeSingle();

  let tagId: string;
  if (existingTag?.id) {
    tagId = existingTag.id;
  } else {
    const { data: inserted, error: insErr } = await admin
      .from('tags')
      .insert({ user_id: user.id, name: tagName })
      .select('id')
      .single();
    if (insErr || !inserted) {
      return NextResponse.json({ error: 'Could not create tag' }, { status: 500 });
    }
    tagId = inserted.id;
  }

  const { error: linkErr } = await admin
    .from('item_tags')
    .upsert({ item_id: itemId, tag_id: tagId }, { onConflict: 'item_id,tag_id' });

  if (linkErr) {
    return NextResponse.json({ error: 'Could not add tag' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Tag added' }, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: itemId } = await params;
  const { searchParams } = new URL(request.url);
  const tagName = searchParams.get('tag')?.trim().toLowerCase();
  if (!tagName) {
    return NextResponse.json({ error: 'Tag name required' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: item, error: itemErr } = await admin
    .from('items')
    .select('id, user_id')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();

  if (itemErr || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const { data: tag } = await admin
    .from('tags')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', tagName)
    .maybeSingle();

  if (!tag?.id) {
    return NextResponse.json({ message: 'Tag removed' }, { status: 200 });
  }

  await admin
    .from('item_tags')
    .delete()
    .eq('item_id', itemId)
    .eq('tag_id', tag.id);

  return NextResponse.json({ message: 'Tag removed' }, { status: 200 });
}
