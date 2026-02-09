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
  const { data: comparison, error } = await admin
    .from('comparisons')
    .select('id, item_ids, result, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !comparison) {
    return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
  }

  return NextResponse.json(comparison);
}
