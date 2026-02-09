import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: collections, error } = await admin
    .from('collections')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load collections' }, { status: 500 });
  }

  return NextResponse.json({ collections: collections ?? [] });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: collection, error } = await admin
    .from('collections')
    .insert({ user_id: user.id, name })
    .select('id, name, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Could not create collection' }, { status: 500 });
  }

  return NextResponse.json(collection, { status: 201 });
}
