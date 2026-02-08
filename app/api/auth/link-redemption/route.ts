import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST() {
  const user = await getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from('invite_redemptions')
    .update({ user_id: user.id })
    .eq('email', user.email)
    .is('user_id', null);

  if (error) {
    return NextResponse.json(
      { error: 'Could not link redemption' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
