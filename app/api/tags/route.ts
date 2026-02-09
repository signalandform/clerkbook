import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: tags, error } = await admin
    .from('tags')
    .select('name')
    .eq('user_id', user.id)
    .order('name');

  if (error) {
    return NextResponse.json({ error: 'Could not fetch tags' }, { status: 500 });
  }

  const tagNames = (tags ?? []).map((t) => t.name as string);
  return NextResponse.json({ tags: tagNames });
}
