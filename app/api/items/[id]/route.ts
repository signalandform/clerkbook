import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from('items')
    .select('id, title, source_type, url, domain, status, raw_text, cleaned_text, original_filename, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
